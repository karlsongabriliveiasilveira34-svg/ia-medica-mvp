import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, ensureUsersSchema } from "../config/database.js";
import { env } from "../config/env.js";
import { emailService } from "./email.service.js";

const fallbackRefreshSecret = crypto.randomBytes(32).toString("hex");
const JWT_SECRET = process.env.JWT_SECRET || env.jwtSecret;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || fallbackRefreshSecret;
const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Store em memória para persistência local caso o banco Postgres local esteja desligado
const memoryUsers = new Map();
const memorySessions = new Map();
const memoryPasswordResetTokens = new Map();
const userLoginHistory = new Map();

// Inicialização dinâmica de contas locais resilientes
function createLocalAccount(name, email, plan, initialPass, crm = null, specialty = null) {
  const hash = bcrypt.hashSync(String(initialPass), 10);
  return {
    id: crypto.randomUUID(),
    name,
    email: (email || "").trim().toLowerCase(),
    password_hash: hash,
    plan,
    app_mode: plan,
    email_verificado: true,
    crm,
    specialty,
    last_ip: "127.0.0.1",
    last_user_agent: "Mozilla/5.0"
  };
}

const defaultAccounts = [
  createLocalAccount("Dr. Karlson Gabriel", process.env.MEDICO_DEMO_EMAIL || "medico.demo@media.med.br", "medico", process.env.DEMO_MEDICO_PASSWORD || "clinica2026", "123456-SP", "Clínica Médica"),
  createLocalAccount("Lucas Silveira (Interno)", process.env.ESTUDANTE_DEMO_EMAIL || "estudante.demo@media.med.br", "estudante", process.env.DEMO_ESTUDANTE_PASSWORD || "senha123")
];

for (const acc of defaultAccounts) {
  memoryUsers.set(acc.email, acc);
}

export class AuthSecurityService {
  /**
   * 1. CADASTRO DE NOVO USUÁRIO (COM HASH SEGURO, PLANO FREE OBRIGATÓRIO E ENVIO DE EMAIL)
   */
  static async registerUser({ name, email, password, crm = null, specialty = null, plan = "free", role = null, app_mode = null, baseUrl = null }) {
    await ensureUsersSchema();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "Colega").trim();
    const userProfile = (role || app_mode || plan || "estudante") === "medico" ? "medico" : "estudante";
    const userPlan = "free"; // Todo novo cadastro inicia estritamente no plano FREE
    console.log(`[AUTH][REGISTER] email normalizado: ${cleanEmail}`);
    console.log(`[AUTH][REGISTER] plano atribuído: ${userPlan} | perfil: ${userProfile}`);

    // 1. Verificar se usuário já existe
    let existingUser = null;
    try {
      const dbCheck = await pool.query("SELECT id, email, email_verificado, plan FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
      if (dbCheck.rows.length > 0) existingUser = dbCheck.rows[0];
    } catch (e) {
      existingUser = memoryUsers.get(cleanEmail);
    }
    if (!existingUser && memoryUsers.has(cleanEmail)) {
      existingUser = memoryUsers.get(cleanEmail);
    }

    if (existingUser) {
      if (existingUser.email_verificado) {
        console.warn(`[AUTH][ERROR] Tentativa de cadastro com email já existente e verificado: ${cleanEmail}`);
        throw new Error("Este endereço de email já está cadastrado. Faça login para continuar.");
      } else {
        console.log(`[AUTH][REGISTER] Usuário já registrado mas não verificado. Atualizando token de ativação para: ${cleanEmail}`);
      }
    }

    // 2. Hash seguro da senha com bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email: cleanEmail, purpose: "email_verification" }, JWT_SECRET, { expiresIn: "24h" });

    let userId = existingUser?.id || null;

    if (existingUser) {
      // Atualizar hash e token de ativação para conta pendente
      try {
        await pool.query(
          "UPDATE users SET name = $1, password_hash = $2, token_verificacao = $3, plan = $4, crm = $5, specialty = $6, app_mode = $7, updated_at = NOW() WHERE LOWER(email) = $8",
          [cleanName, passwordHash, verificationToken, userPlan, crm, specialty, userProfile, cleanEmail]
        );
      } catch (e) {
        const mem = memoryUsers.get(cleanEmail);
        if (mem) {
          mem.name = cleanName;
          mem.password_hash = passwordHash;
          mem.token_verificacao = verificationToken;
          mem.plan = userPlan;
          mem.app_mode = userProfile;
        }
      }
    } else {
      // Inserir novo usuário com plano FREE
      try {
        const query = `
          INSERT INTO users (name, email, password_hash, plan, crm, specialty, email_verificado, token_verificacao, app_mode)
          VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
          RETURNING id, name, email, plan, app_mode, email_verificado;
        `;
        const values = [
          cleanName,
          cleanEmail,
          passwordHash,
          userPlan,
          crm,
          specialty,
          verificationToken,
          userProfile
        ];
        const res = await pool.query(query, values);
        userId = res.rows[0].id;
      } catch (dbErr) {
        console.warn("[AUTH][REGISTER] Fallback para storage em memória:", dbErr.message);
        userId = `mem_${Date.now()}`;
        memoryUsers.set(cleanEmail, {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          password_hash: passwordHash,
          plan: userPlan,
          crm,
          specialty,
          email_verificado: false,
          token_verificacao: verificationToken,
          app_mode: userProfile
        });
      }
    }

    // Sincronizar store em memória
    memoryUsers.set(cleanEmail, {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password_hash: passwordHash,
      plan: userPlan,
      crm,
      specialty,
      email_verificado: false,
      token_verificacao: verificationToken,
      app_mode: userProfile
    });

    console.log(`[AUTH][REGISTER] usuário criado: ${userId} (Plano: ${userPlan})`);

    // 3. Disparar envio de email assíncrono com link oficial
    emailService.sendVerificationEmail(cleanEmail, verificationToken, cleanName, baseUrl).catch(err => {
      console.error("[AUTH][ERROR] Falha no disparo do email de verificação:", err.message);
    });

    return {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      plan: userPlan,
      app_mode: userProfile,
      email_verificado: false,
      verificationToken
    };
  }

  /**
   * 2. CONFIRMAÇÃO DE EMAIL & LOGIN AUTOMÁTICO
   * Valida o token, marca email_verificado = true e GERA A SESSÃO IMEDIATAMENTE
   */
  static async verifyEmailToken(token) {
    if (!token) throw new Error("Token de verificação inválido.");
    console.log("[AUTH][VERIFY] token recebido");

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.purpose && decoded.purpose !== "email_verification") {
        throw new Error("Finalidade do token inválida.");
      }
    } catch (err) {
      console.warn("[AUTH][ERROR] Token de verificação inválido ou expirado:", err.message);
      throw new Error("Link de verificação expirado ou inválido.");
    }

    const email = (decoded.email || "").trim().toLowerCase();
    await ensureUsersSchema();

    // Atualizar no banco de dados e obter usuário completo
    let user = null;
    try {
      const res = await pool.query(
        "UPDATE users SET email_verificado = TRUE, token_verificacao = NULL, updated_at = NOW() WHERE LOWER(email) = $1 RETURNING id, name, email, plan, app_mode, crm, specialty, email_verificado",
        [email]
      );
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    } catch (err) {
      console.warn("[AUTH][VERIFY] Aviso ao atualizar banco de dados:", err.message);
    }

    // Atualizar também no storage em memória
    const memUser = memoryUsers.get(email);
    if (memUser) {
      memUser.email_verificado = true;
      memUser.token_verificacao = null;
      if (!user) user = memUser;
    }

    if (!user) {
      // Tentar buscar por select se o update não retornou linhas
      try {
        const selectRes = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [email]);
        if (selectRes.rows.length > 0) user = selectRes.rows[0];
      } catch (e) {}
    }

    if (!user) {
      console.warn(`[AUTH][ERROR] Usuário não encontrado para o email: ${email}`);
      throw new Error("Usuário associado ao token não foi encontrado.");
    }

    console.log(`[AUTH][VERIFY] usuário encontrado: ${user.id}`);
    console.log("[AUTH][VERIFY] email confirmado");

    // Gerar Sessão Autenticada Imediata (Login Automático com Avatar)
    const emailClean = user.email || cleanEmail;
    const emailHash = crypto.createHash("sha256").update((emailClean || "").trim().toLowerCase()).digest("hex");
    const avatarUrl = user.photo_url || `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`;

    const payload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name || "Colega",
      avatar: avatarUrl,
      photo_url: avatarUrl,
      plan: user.plan || "free",
      app_mode: user.app_mode || "estudante",
      crm: user.crm || null,
      specialty: user.specialty || null,
      email_verificado: true
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await pool.query(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [user.id, refreshToken, expiresAt]
      );
    } catch (e) {
      memorySessions.set(refreshToken, { userId: user.id, expiresAt });
    }

    console.log("[AUTH][VERIFY] sessão criada");

    return {
      success: true,
      accessToken,
      refreshToken,
      user: payload
    };
  }

  /**
   * 3. REENVIAR EMAIL DE VERIFICAÇÃO
   */
  static async resendVerificationEmail(email, baseUrl = null) {
    const cleanEmail = (email || "").trim().toLowerCase();
    await ensureUsersSchema();
    let user = null;

    try {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    } catch (e) {
      user = memoryUsers.get(cleanEmail);
    }
    if (!user && memoryUsers.has(cleanEmail)) user = memoryUsers.get(cleanEmail);

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.email_verificado) {
      return { success: true, message: "Este email já foi verificado anteriormente. Você pode entrar diretamente com sua senha." };
    }

    const verificationToken = jwt.sign({ email: cleanEmail, purpose: "email_verification" }, JWT_SECRET, { expiresIn: "24h" });
    
    try {
      await pool.query("UPDATE users SET token_verificacao = $1 WHERE LOWER(email) = $2", [verificationToken, cleanEmail]);
    } catch (e) {
      user.token_verificacao = verificationToken;
    }

    await emailService.sendVerificationEmail(cleanEmail, verificationToken, user.name, baseUrl);
    return { success: true, message: "Novo email de verificação enviado com sucesso!" };
  }

  /**
   * 4. LOGIN COM VALIDAÇÃO DE SENHA E VERIFICAÇÃO DE EMAIL OBRIGATÓRIA
   */
  static async loginUser({ email, password, ip = "127.0.0.1", userAgent = "Navegador Web" }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log(`[AUTH][LOGIN] tentativa: ${cleanEmail}`);

    await ensureUsersSchema();

    let user = null;
    try {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    } catch (dbErr) {
      user = memoryUsers.get(cleanEmail);
    }
    if (!user && memoryUsers.has(cleanEmail)) {
      user = memoryUsers.get(cleanEmail);
    }

    if (!user) {
      console.warn(`[AUTH][ERROR] Usuário não encontrado: ${cleanEmail}`);
      throw new Error("Credenciais inválidas. Verifique seu email e senha.");
    }

    console.log(`[AUTH][LOGIN] usuário encontrado: ${user.id}`);

    // Validação da senha com bcrypt
    if (!user.password_hash) {
      console.warn(`[AUTH][ERROR] Usuário ${cleanEmail} sem password_hash configurado.`);
      throw new Error("Credenciais inválidas. Verifique seu email e senha.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn(`[AUTH][ERROR] Senha incorreta para o usuário: ${cleanEmail}`);
      throw new Error("Credenciais inválidas. Verifique seu email e senha.");
    }

    console.log("[AUTH][LOGIN] senha válida");

    // REGRA DE OURO: Bloquear login se email não foi verificado
    if (user.email_verificado === false) {
      console.warn(`[AUTH][ERROR] ❌ Login bloqueado: ${cleanEmail} ainda não verificou o email.`);
      const err = new Error("Seu email ainda não foi verificado. Por favor, acesse o link de ativação enviado para sua caixa de entrada.");
      err.code = "EMAIL_NOT_VERIFIED";
      err.email = cleanEmail;
      throw err;
    }

    // Atualizar histórico de login e IP
    const previousLogin = userLoginHistory.get(cleanEmail) || { last_ip: user.last_ip, last_user_agent: user.last_user_agent };
    let isSuspicious = false;

    if (previousLogin.last_ip && previousLogin.last_ip !== ip && ip !== "127.0.0.1" && ip !== "::1") {
      isSuspicious = true;
      console.log(`[AUTH] ⚠️ Acesso considerado suspeito: IP mudou de ${previousLogin.last_ip} para ${ip}`);
    }

    userLoginHistory.set(cleanEmail, { last_ip: ip, last_user_agent: userAgent, loginAt: new Date() });
    try {
      await pool.query("UPDATE users SET last_login = NOW(), last_ip = $1, last_user_agent = $2 WHERE id = $3", [ip, userAgent, user.id]);
    } catch (e) {}

    // Disparar email de notificação de login de forma assíncrona
    emailService.sendLoginNotificationEmail(
      cleanEmail,
      user.name || "Colega",
      { ip, userAgent, timestamp: new Date() },
      isSuspicious
    ).catch(err => console.error("[AUTH][ERROR] Falha ao enviar notificação de login:", err.message));

    // Gerar Tokens JWT com Avatar Real (Gravatar / Foto)
    const emailClean = user.email || cleanEmail;
    const emailHash = crypto.createHash("sha256").update((emailClean || "").trim().toLowerCase()).digest("hex");
    const avatarUrl = user.photo_url || `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`;

    const payload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name || "Colega",
      avatar: avatarUrl,
      photo_url: avatarUrl,
      plan: user.plan || "free",
      app_mode: user.app_mode || "estudante",
      crm: user.crm || null,
      specialty: user.specialty || null,
      email_verificado: true
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await pool.query(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [user.id, refreshToken, expiresAt]
      );
    } catch (sessionErr) {
      memorySessions.set(refreshToken, { userId: user.id, expiresAt });
    }

    console.log("[AUTH][LOGIN] sessão criada");
    console.log(`[AUTH] ✅ Login bem-sucedido e JWT emitido para ${cleanEmail} (Plano: ${user.plan})`);

    return {
      accessToken,
      refreshToken,
      user: payload
    };
  }

  /**
   * 5. ESQUECI MINHA SENHA (RECUPERAÇÃO)
   */
  static async requestPasswordReset(email, baseUrl = null) {
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log(`[AUTH] 🔑 Solicitação de recuperação de senha para ${cleanEmail}`);

    await ensureUsersSchema();

    let user = null;
    try {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    } catch (e) {
      user = memoryUsers.get(cleanEmail);
    }
    if (!user && memoryUsers.has(cleanEmail)) user = memoryUsers.get(cleanEmail);

    if (!user) {
      // Retorna sucesso para evitar enumeração de emails
      return { success: true, message: "Se o email estiver cadastrado, as instruções de recuperação serão enviadas." };
    }

    const resetToken = jwt.sign({ email: cleanEmail, purpose: "password_reset" }, JWT_SECRET, { expiresIn: "1h" });
    memoryPasswordResetTokens.set(resetToken, { email: cleanEmail, expiresAt: Date.now() + 3600000 });

    await emailService.sendPasswordResetEmail(cleanEmail, resetToken, user.name, baseUrl);
    return { success: true, message: "Instruções de recuperação enviadas para o seu email." };
  }

  /**
   * 6. REDEFINIR SENHA COM TOKEN
   */
  static async resetPasswordWithToken(token, newPassword) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new Error("Senha deve ter no mínimo 6 caracteres e o token é obrigatório.");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.purpose !== "password_reset") throw new Error("Token inválido para redefinição.");
    } catch (err) {
      throw new Error("Link de redefinição expirado ou inválido.");
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const email = (decoded.email || "").trim().toLowerCase();

    await ensureUsersSchema();

    try {
      await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2", [newHash, email]);
    } catch (e) {
      const user = memoryUsers.get(email);
      if (user) user.password_hash = newHash;
    }

    const memUser = memoryUsers.get(email);
    if (memUser) memUser.password_hash = newHash;

    console.log(`[AUTH] ✅ Senha redefinida com sucesso para ${email}!`);
    return { success: true, message: "Senha redefinida com sucesso! Você já pode fazer login." };
  }

  /**
   * 7. RENOVAÇÃO DE ACCESS TOKEN VIA REFRESH TOKEN
   */
  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token obrigatório.");

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new Error("Refresh token expirado ou inválido.");
    }

    const payload = {
      id: decoded.id,
      email: decoded.email
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return { accessToken: newAccessToken };
  }
}
