import { Router } from "express";
import { googleLoginHandler, demoLoginHandler, getCurrentUserHandler } from "../controllers/auth-google.controller.js";
import { generateToken, verifyToken } from "../utils/token.util.js";
import { googleAuthService } from "../services/google-auth.service.js";
import { authLimiter } from "../middleware/rate-limiter.middleware.js";

export const authRouter = Router();

// Aplicar rate limiter específico para autenticação
authRouter.use(["/api/auth", "/auth"], authLimiter);

// --- AUTENTICAÇÃO GOOGLE OAUTH 2.0 (SEM SENHA) ---
authRouter.post(["/api/auth/google", "/auth/google"], googleLoginHandler);
authRouter.post(["/api/auth/demo-login", "/auth/demo-login"], demoLoginHandler);
authRouter.get(["/api/auth/me", "/auth/me"], getCurrentUserHandler);

// Verificação de Sessão (Compatibilidade)
authRouter.get(["/api/auth/verify", "/auth/verify"], (req, res) => {
  const authHeader = req.headers.authorization || req.headers["x-demo-token"];
  if (!authHeader) {
    return res.json({ status: "success", authenticated: false });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const googleDecoded = googleAuthService.verifySessionToken(token);
  const oldDecoded = verifyToken(token);
  const user = googleDecoded || oldDecoded;

  return res.json({
    status: "success",
    authenticated: !!user,
    user: user || null
  });
});

// Fallback de login legado (redireciona para demo)
authRouter.post(["/api/auth/login", "/auth/login"], demoLoginHandler);
