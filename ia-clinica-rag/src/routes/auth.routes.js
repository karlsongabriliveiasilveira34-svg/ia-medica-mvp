import { Router } from "express";
import { AuthSecurityService } from "../services/auth-security.service.js";
import { verifyRecaptchaMiddleware } from "../middleware/recaptcha.middleware.js";
import { authLimiter } from "../middleware/rate-limiter.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const authRouter = Router();

// Aplicar rate limiter específico para autenticação
authRouter.use(["/api/auth", "/auth"], authLimiter);

// 1. CADASTRO DE NOVO USUÁRIO (SIGNUP) — COM RECAPTCHA E ENVIO DE EMAIL
authRouter.post(
  ["/api/auth/register", "/auth/register", "/api/auth/signup"],
  verifyRecaptchaMiddleware,
  async (req, res) => {
    try {
      const { name, email, password, crm, specialty, plan } = req.body;
      if (!name || typeof name !== "string" || !email || typeof email !== "string" || !password || typeof password !== "string") {
        return res.status(400).json({
          status: "error",
          code: "MISSING_FIELDS",
          message: "Nome, email e senha válidos são obrigatórios."
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: "error",
          code: "WEAK_PASSWORD",
          message: "A senha deve ter no mínimo 6 caracteres."
        });
      }

      const result = await AuthSecurityService.registerUser({ name, email, password, crm, specialty, plan });
      return res.status(201).json({
        status: "success",
        message: "Cadastro realizado com sucesso! Enviamos um link de verificação para o seu email.",
        user: result
      });
    } catch (err) {
      console.error("[AUTH][ERROR] Erro no cadastro:", err.message);
      return res.status(400).json({ status: "error", message: err.message });
    }
  }
);

// 2. LOGIN DE USUÁRIO (COM RECAPTCHA, BCRYPT, DETECÇÃO DE IP E NOTIFICAÇÃO)
authRouter.post(
  ["/api/auth/login", "/auth/login"],
  verifyRecaptchaMiddleware,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          code: "MISSING_CREDENTIALS",
          message: "Por favor, informe seu email e senha."
        });
      }

      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "Navegador Web";

      const result = await AuthSecurityService.loginUser({
        email,
        password,
        ip: clientIp,
        userAgent
      });

      return res.json({
        status: "success",
        message: "Login efetuado com sucesso!",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      });
    } catch (err) {
      console.warn(`[AUTH][ERROR] Falha de login: ${err.message}`);
      if (err.code === "EMAIL_NOT_VERIFIED") {
        return res.status(403).json({
          status: "error",
          code: "EMAIL_NOT_VERIFIED",
          email: err.email,
          message: err.message
        });
      }
      return res.status(401).json({ status: "error", message: err.message });
    }
  }
);

// 3. CONFIRMAÇÃO DE EMAIL VIA TOKEN COM LOGIN AUTOMÁTICO
authRouter.post(["/api/auth/verify-email", "/auth/verify-email"], async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ status: "error", message: "Token de verificação ausente." });
    }
    const result = await AuthSecurityService.verifyEmailToken(token);

    // Definir cookie HTTP-only de autenticação
    res.cookie("auth_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    console.log("[AUTH][VERIFY] cookie enviado");

    return res.json({
      status: "success",
      message: "Email verificado com sucesso! Sessão iniciada automaticamente.",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
});

// 4. REENVIAR EMAIL DE VERIFICAÇÃO
authRouter.post(["/api/auth/resend-verification", "/auth/resend-verification"], async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: "error", message: "Informe seu endereço de email." });
    }
    const result = await AuthSecurityService.resendVerificationEmail(email);
    return res.json({ status: "success", message: result.message });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
});

// 5. ESQUECI MINHA SENHA (COM RECAPTCHA)
authRouter.post(
  ["/api/auth/forgot-password", "/auth/forgot-password"],
  verifyRecaptchaMiddleware,
  async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: "error", message: "Informe seu email cadastrado." });
      }
      const result = await AuthSecurityService.requestPasswordReset(email);
      return res.json({ status: "success", message: result.message });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  }
);

// 6. REDEFINIÇÃO DE SENHA COM TOKEN
authRouter.post(["/api/auth/reset-password", "/auth/reset-password"], async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await AuthSecurityService.resetPasswordWithToken(token, newPassword);
    return res.json({ status: "success", message: result.message });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
});

// 7. RENOVAÇÃO DE ACCESS TOKEN
authRouter.post(["/api/auth/refresh", "/auth/refresh"], async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthSecurityService.refreshAccessToken(refreshToken);
    return res.json({
      status: "success",
      accessToken: result.accessToken
    });
  } catch (err) {
    return res.status(401).json({ status: "error", message: err.message });
  }
});

// 8. OBTER USUÁRIO ATUAL / ME
authRouter.get(["/api/user", "/user", "/api/auth/me", "/auth/me"], authenticate, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Não autenticado." });
  }
  return res.json({
    status: "success",
    user: req.user
  });
});

// 9. TESTE DIAGNÓSTICO DE ENVIO SMTP
authRouter.post(["/api/auth/test-email", "/auth/test-email"], async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ status: "error", message: "Informe um endereço de email válido." });
    }

    const { emailService } = await import("../services/email.service.js");
    const result = await emailService.sendMail({
      to: email,
      subject: "🧪 Teste de Conexão SMTP — Plataforma MedIa",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #faf8f5; border-radius: 12px;">
          <h2 style="color: #213f34;">✅ Conexão SMTP Validada com Sucesso!</h2>
          <p>Este é um email de teste disparado pelo servidor MedIa para confirmar a entrega ponta a ponta.</p>
          <p><strong>Destinatário:</strong> ${email}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      text: `Teste de Conexão SMTP MedIa executado com sucesso para ${email} às ${new Date().toISOString()}`
    });

    if (result.success) {
      return res.json({
        status: "success",
        message: `Email de teste aceito pelo servidor SMTP para ${email}`,
        messageId: result.messageId || null,
        simulated: Boolean(result.simulated)
      });
    } else {
      return res.status(502).json({
        status: "error",
        message: "Falha ao enviar email pelo SMTP",
        error: result.error
      });
    }
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
