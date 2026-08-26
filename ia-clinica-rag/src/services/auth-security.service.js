import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { emailService } from "./email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || env.jwtSecret || crypto.randomBytes(32).toString("hex");
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Store em memória para persistência local caso o banco Postgres local esteja desligado
const memoryUsers = new Map();
const memorySessions = new Map();
const memoryPasswordResetTokens = new Map();
const userLoginHistory = new Map();

// Seed inicial dinâmico e seguro para testes locais
const initialMedPass = process.env.DEMO_MEDICO_PASSWORD || process.env.DEMO_PASSWORD || "clinica2026";
const initialEstPass = process.env.DEMO_ESTUDANTE_PASSWORD || "senha123";

const demoMedHashed = await bcrypt.hash(String(initialMedPass), 10);
memoryUsers.set("medico.demo@media.med.br", {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Dr. Karlson Gabriel",
  email: "medico.demo@media.med.br",
  password_hash: demoMedHashed,
  plan: "medico",
  app_mode: "medico",
  email_verificado: true,
  crm: "123456-SP",
  specialty: "Clínica Médica",
  last_ip: "127.0.0.1",
  last_user_agent: "Mozilla/5.0"
});

const demoEstHashed = await bcrypt.hash(String(initialEstPass), 10);
memoryUsers.set("estudante.demo@media.med.br", {
  id: "00000000-0000-0000-0000-000000000002",
  name: "Lucas Silveira (Interno)",
  email: "estudante.demo@media.med.br",
  password_hash: demoEstHashed,
  plan: "estudante",
  app_mode: "estudante",
  email_verificado: true,
  crm: null,
  specialty: null,
  last_ip: "127.0.0.1",
  last_user_agent: "Mozilla/5.0"
});

export class AuthSecurityService {
  /**
   * 1. CADASTRO (SIGNUP)
   * Cria conta com email_verificado = false e dispara email de verificação
   */
  static async registerUser({ name, email, password, crm = null, specialty = null, plan = "estudante" }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log(`[AUTH] 📝 Registrando novo usuário: ${cleanEmail} (Plano: ${plan})`);

    // Verificar se usuário já existe
    let existingUser = null;
    try {
      const dbCheck = await pool.query("SELECT id, email FROM users WHERE email = $1", [cleanEmail]);
      if (dbCheck.rows.length > 0) existingUser = dbCheck.rows[0];
    } catch (e) {
      existingUser = memoryUsers.get(cleanEmail);
    }
    if (!existingUser && memoryUsers.has(cleanEmail)) {
      existingUser = memoryUsers.get(cleanEmail);
    }

    if (existingUser) {
      console.warn(`[AUTH][ERROR] Tentativa de cadastro com email já existente: ${cleanEmail}`);
      throw new Error("Este endereço de email já está cadastrado.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email: cleanEmail, purpose: "email_verification" }, JWT_SECRET, { expiresIn: "24h" });

    let userId = null;

    try {
      const query = `
        INSERT INTO users (name, email, google_id, password_hash, plan, crm, specialty, email_verificado, token_verificacao, app_mode)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, email, plan, app_mode, email_verificado;
      `;
      const values = [
        name,
        cleanEmail,
        `local_${Date.now()}`,
        passwordHash,
        plan,
        crm,
        specialty,
        false, // SEMPRE INICIA NÃO VERIFICADO
        verificationToken,
        plan === "medico" ? "medico" : "estudante"
      ];
      const res = await pool.query(query, values);
      userId = res.rows[0].id;
    } catch (dbErr) {
      userId = `mem_${Date.now()}`;
      memoryUsers.set(cleanEmail, {
        id: userId,
        name,
        email: cleanEmail,
        password_hash: passwordHash,
        plan,
        crm,
        specialty,
        email_verificado: false,
        token_verificacao: verificationToken,
        app_mode: plan === "medico" ? "medico" : "estudante"
      });
    }

    // Disparar envio de email assíncrono (não bloqueia o signup se o SMTP demorar)
    emailService.sendVerificationEmail(cleanEmail, verificationToken, name).catch(err => {
      console.error("[AUTH][ERROR] Falha no disparo do email de verificação:", err.message);
    });

    console.log(`[AUTH] ✅ Conta criada com sucesso para ${cleanEmail}. Email não verificado.`);

    return {
      id: userId,
      name,
      email: cleanEmail,
      plan,
      email_verificado: false,
      verificationToken
    };
  }

  /**
   * 2. CONFIRMAÇÃO DE EMAIL
   * Ativa a conta quando o usuário clica no link do email
   */
  static async verifyEmailToken(token) {
    if (!token) throw new Error("Token de verificação inválido.");

    console.log(`[AUTH] 📩 Validando token de ativação de email`);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("[AUTH][ERROR] Token de verificação inválido ou expirado:", err.message);
      throw new Error("Link de verificação expirado ou inválido.");
    }

    const email = decoded.email;

    try {
      await pool.query("UPDATE users SET email_verificado = TRUE, token_verificacao = NULL WHERE email = $1", [email]);
    } catch (err) {
      const user = memoryUsers.get(email);
      if (user) {
        user.email_verificado = true;
        user.token_verificacao = null;
      }
    }

    const memoryUser = memoryUsers.get(email);
    if (memoryUser) {
      memoryUser.email_verificado = true;
      memoryUser.token_verificacao = null;
    }

    console.log(`[AUTH] ✅ Email verificado com sucesso para ${email}!`);
    return { success: true, email };
  }

  /**
   * 3. REENVIAR EMAIL DE VERIFICAÇÃO
   */
  static async resendVerificationEmail(email) {
    const cleanEmail = (email || "").trim().toLowerCase();
    let user = null;

    try {
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    } catch (e) {
      user = memoryUsers.get(cleanEmail);
    }
    if (!user && memoryUsers.has(cleanEmail)) user = memoryUsers.get(cleanEmail);

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.email_verificado) {
      return { success: true, message: "Este email já foi verificado anteriormente." };
    }

    const verificationToken = jwt.sign({ email: cleanEmail, purpose: "email_verification" }, JWT_SECRET, { expiresIn: "24h" });
    
    try {
      await pool.query("UPDATE users SET token_verificacao = $1 WHERE email = $2", [verificationToken, cleanEmail]);
    } catch (e) {
      user.token_verificacao = verificationToken;
    }

    await emailService.sendVerificationEmail(cleanEmail, verificationToken, user.name);
    return { success: true, message: "Novo email de verificação enviado com sucesso!" };
  }

  /**
   * 4. LOGIN COM VALIDAÇÃO DE SENHA E VERIFICAÇÃO DE EMAIL OBRIGATÓRIA
   */
  static async loginUser({ email, password, ip = "127.0.0.1", userAgent = "Navegador Web" }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log(`[AUTH] 🔑 Tentativa de login para: ${cleanEmail} (IP: ${ip})`);

    let user = null;
    try {
      const res = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [cleanEmail]);
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

    // Validação da senha com bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn(`[AUTH][ERROR] Senha incorreta para o usuário: ${cleanEmail}`);
      throw new Error("Credenciais inválidas. Verifique seu email e senha.");
    }

    // REGRA DE OURO: Bloquear login se email não foi verificado
    if (user.email_verificado === false) {
      console.warn(`[AUTH][ERROR] ❌ Login bloqueado: ${cleanEmail} ainda não verificou o email.`);
      const err = new Error("Seu email ainda não foi verificado. Por favor, acesse o link enviado para sua caixa de entrada.");
      err.code = "EMAIL_NOT_VERIFIED";
      err.email = cleanEmail;
      throw err;
    }

    // 5. DETECÇÃO DE LOGIN SUSPEITO (IP ou User-Agent diferente do habitual)
    const previousLogin = userLoginHistory.get(cleanEmail) || { last_ip: user.last_ip, last_user_agent: user.last_user_agent };
    let isSuspicious = false;

    if (previousLogin.last_ip && previousLogin.last_ip !== ip && ip !== "127.0.0.1" && ip !== "::1") {
      isSuspicious = true;
      console.log(`[AUTH] ⚠️ Acesso considerado suspeito: IP mudou de ${previousLogin.last_ip} para ${ip}`);
    }

    // Atualizar histórico de login
    userLoginHistory.set(cleanEmail, { last_ip: ip, last_user_agent: userAgent, loginAt: new Date() });
    try {
      await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
    } catch (e) {}

    // Disparar email de notificação de login de forma assíncrona
    emailService.sendLoginNotificationEmail(
      cleanEmail,
      user.name || "Usuário",
      { ip, userAgent, timestamp: new Date() },
      isSuspicious
    ).catch(err => console.error("[AUTH][ERROR] Falha ao enviar notificação de login:", err.message));

    // Gerar Tokens JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan || "estudante",
      app_mode: user.app_mode || "estudante",
      email_verificado: true
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await pool.query(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refreshToken, expiresAt]
      );
    } catch (sessionErr) {
      memorySessions.set(refreshToken, { userId: user.id, expiresAt });
    }

    console.log(`[AUTH] ✅ Login bem-sucedido e JWT emitido para ${cleanEmail} (Plano: ${user.plan})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan || "estudante",
        app_mode: user.app_mode || "estudante",
        crm: user.crm,
        specialty: user.specialty,
        email_verificado: true
      }
    };
  }

  /**
   * 6. ESQUECI MINHA SENHA (RECUPERAÇÃO)
   */
  static async requestPasswordReset(email) {
    const cleanEmail = (email || "").trim().toLowerCase();
    console.log(`[AUTH] 🔑 Solicitação de recuperação de senha para ${cleanEmail}`);

    let user = null;
    try {
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
      if (res.rows.length > 0) user = res.rows[0];
    } catch (e) {
      user = memoryUsers.get(cleanEmail);
    }
    if (!user && memoryUsers.has(cleanEmail)) user = memoryUsers.get(cleanEmail);

    if (!user) {
      // Retorna sucesso para evitar enumeração de emails
      return { success: true, message: "Se o email estiver cadastrado, as instruções serão enviadas." };
    }

    const resetToken = jwt.sign({ email: cleanEmail, purpose: "password_reset" }, JWT_SECRET, { expiresIn: "1h" });
    memoryPasswordResetTokens.set(resetToken, { email: cleanEmail, expiresAt: Date.now() + 3600000 });

    await emailService.sendPasswordResetEmail(cleanEmail, resetToken, user.name);
    return { success: true, message: "Instruções de recuperação enviadas para o seu email." };
  }

  /**
   * 7. REDEFINIR SENHA COM TOKEN
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
    const email = decoded.email;

    try {
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [newHash, email]);
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
   * 8. RENOVAÇÃO DE ACCESS TOKEN VIA REFRESH TOKEN
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
