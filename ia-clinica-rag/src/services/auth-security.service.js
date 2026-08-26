import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";

const JWT_SECRET = process.env.JWT_SECRET || env.jwtSecret || "media-super-secret-jwt-key-2026-secure-32chars";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "media-super-secret-refresh-key-2026-secure-32chars";
const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Store em memória para sessões e usuários caso o banco Postgres esteja temporariamente indisponível
const memoryUsers = new Map();
const memorySessions = new Map();

// Usuário padrão de demonstração para testes imediatos
const demoHashedPassword = await bcrypt.hash("senha123", 10);
memoryUsers.set("medico.demo@media.med.br", {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Dr. Karlson Gabriel",
  email: "medico.demo@media.med.br",
  password_hash: demoHashedPassword,
  plan: "medico",
  app_mode: "medico",
  email_verificado: true,
  crm: "123456-SP",
  specialty: "Clínica Médica"
});

export class AuthSecurityService {
  /**
   * Configuração do transportador de email para verificação
   */
  static getEmailTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return null;
    }
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Envia email de verificação de conta
   */
  static async sendVerificationEmail(email, token, name) {
    const transporter = this.getEmailTransporter();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const verifyLink = `${frontendUrl}/verificar-email?token=${token}`;

    if (!transporter) {
      console.log(`[AUTH] 📧 Email de verificação simulado para ${email}: Link -> ${verifyLink}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"MedIa Clínica" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verificação de Conta — MedIa v2.0",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e8e2d7; border-radius: 16px; background-color: #faf8f5;">
            <h2 style="color: #213f34;">Bem-vindo ao MedIa, ${name || 'Colega Médico/Estudante'}!</h2>
            <p style="color: #4f5c56; font-size: 14px;">Para ativar sua conta e liberar o acesso com segurança, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #213f34; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; font-size: 14px; display: inline-block;">Verificar Meu Email</a>
            </div>
            <p style="color: #8a9690; font-size: 12px;">Se você não solicitou este cadastro, desconsidere este email.</p>
          </div>
        `
      });
      return true;
    } catch (err) {
      console.warn(`[AUTH] ⚠️ Falha ao enviar email real para ${email}, link ativo:`, verifyLink);
      return false;
    }
  }

  /**
   * Cadastro de novo usuário com hash bcrypt e token de verificação
   */
  static async registerUser({ name, email, password, crm = null, specialty = null, plan = "estudante" }) {
    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email: cleanEmail }, JWT_SECRET, { expiresIn: "24h" });

    let userId = null;

    try {
      // Tentar salvar no PostgreSQL
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
        false,
        verificationToken,
        plan === "medico" ? "medico" : "estudante"
      ];
      const res = await pool.query(query, values);
      userId = res.rows[0].id;
    } catch (dbErr) {
      // Fallback em memória
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

    // Disparar envio de email
    await this.sendVerificationEmail(cleanEmail, verificationToken, name);

    return {
      id: userId,
      name,
      email: cleanEmail,
      plan,
      email_verificado: false,
      verificationTokenSimulated: verificationToken
    };
  }

  /**
   * Login com validação de senha e emissão de Tokens JWT (Access + Refresh)
   */
  static async loginUser({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    try {
      const res = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [cleanEmail]);
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    } catch (dbErr) {
      user = memoryUsers.get(cleanEmail);
    }

    if (!user && memoryUsers.has(cleanEmail)) {
      user = memoryUsers.get(cleanEmail);
    }

    if (!user) {
      throw new Error("Credenciais inválidas. Usuário não encontrado.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Credenciais inválidas. Senha incorreta.");
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan || "free",
      app_mode: user.app_mode || "medico"
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Salvar refresh token na tabela sessions
    try {
      await pool.query(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refreshToken, expiresAt]
      );
    } catch (sessionErr) {
      memorySessions.set(refreshToken, { userId: user.id, expiresAt });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan || "free",
        app_mode: user.app_mode || "medico",
        crm: user.crm,
        specialty: user.specialty,
        email_verificado: user.email_verificado !== false
      }
    };
  }

  /**
   * Renovação de Access Token via Refresh Token
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

  /**
   * Verificação de Email pelo Token
   */
  static async verifyEmailToken(token) {
    if (!token) throw new Error("Token de verificação inválido.");

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error("Link de verificação expirado ou inválido.");
    }

    try {
      await pool.query("UPDATE users SET email_verificado = TRUE, token_verificacao = NULL WHERE email = $1", [decoded.email]);
    } catch (err) {
      const user = memoryUsers.get(decoded.email);
      if (user) user.email_verificado = true;
    }

    return { success: true, email: decoded.email };
  }
}
