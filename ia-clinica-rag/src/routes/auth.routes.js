import { Router } from "express";
import { AuthSecurityService } from "../services/auth-security.service.js";
import { googleLoginHandler, demoLoginHandler, getCurrentUserHandler } from "../controllers/auth-google.controller.js";
import { authLimiter } from "../middleware/rate-limiter.middleware.js";

export const authRouter = Router();

// Aplicar rate limiter específico para autenticação
authRouter.use(["/api/auth", "/auth"], authLimiter);

// 1. CADASTRO DE NOVO USUÁRIO (SIGNUP)
authRouter.post(["/api/auth/register", "/auth/register", "/api/auth/signup"], async (req, res) => {
  try {
    const { name, email, password, crm, specialty, plan } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email e senha são obrigatórios." });
    }

    const result = await AuthSecurityService.registerUser({ name, email, password, crm, specialty, plan });
    return res.status(201).json({
      status: "success",
      message: "Cadastro realizado com sucesso! Verifique seu email para confirmação.",
      user: result
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
});

// 2. LOGIN DE USUÁRIO (COM BCRYPT E JWT ACCESS+REFRESH TOKENS)
authRouter.post(["/api/auth/login", "/auth/login"], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // Se não veio senha, fallback para demo
      return demoLoginHandler(req, res);
    }

    const result = await AuthSecurityService.loginUser({ email, password });
    return res.json({
      status: "success",
      message: "Login efetuado com sucesso!",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (err) {
    return res.status(401).json({ status: "error", message: err.message });
  }
});

// 3. RENOVAÇÃO DE ACCESS TOKEN
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

// 4. VERIFICAÇÃO DE EMAIL
authRouter.post(["/api/auth/verify-email", "/auth/verify-email"], async (req, res) => {
  try {
    const { token } = req.body;
    const result = await AuthSecurityService.verifyEmailToken(token);
    return res.json({
      status: "success",
      message: "Email verificado com sucesso!",
      email: result.email
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
});

// 5. OBTER USUÁRIO ATUAL / ME
authRouter.get(["/api/auth/me", "/auth/me"], getCurrentUserHandler);

// 6. GOOGLE OAUTH E DEMO LOGIN (COMPATIBILIDADE)
authRouter.post(["/api/auth/google", "/auth/google"], googleLoginHandler);
authRouter.post(["/api/auth/demo-login", "/auth/demo-login"], demoLoginHandler);

// 7. VERIFICAÇÃO DE SESSÃO
authRouter.get(["/api/auth/verify", "/auth/verify"], (req, res) => {
  const authHeader = req.headers.authorization || req.headers["x-demo-token"];
  if (!authHeader) {
    return res.json({ status: "success", authenticated: false });
  }
  return res.json({ status: "success", authenticated: true });
});
