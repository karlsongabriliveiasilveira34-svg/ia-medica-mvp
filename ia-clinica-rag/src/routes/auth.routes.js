import { Router } from "express";
import { env } from "../config/env.js";
import { generateToken, verifyToken } from "../utils/token.util.js";

export const authRouter = Router();

const handleLogin = (req, res) => {
  const { password } = req.body || {};

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Por favor, informe a senha de acesso."
    });
  }

  if (password.trim() !== env.demoPassword.trim()) {
    return res.status(401).json({
      status: "error",
      message: "Senha incorreta. Verifique a senha da clínica e tente novamente."
    });
  }

  const token = generateToken({ role: "clinica_demo", authenticatedAt: new Date().toISOString() });

  return res.json({
    status: "success",
    message: "Acesso autorizado com sucesso!",
    token
  });
};

const handleVerify = (req, res) => {
  const authHeader = req.headers.authorization || req.headers["x-demo-token"];
  if (!authHeader) {
    return res.json({ status: "success", authenticated: false });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token);
  return res.json({
    status: "success",
    authenticated: !!decoded,
    user: decoded || null
  });
};

authRouter.post(["/api/auth/login", "/auth/login"], handleLogin);
authRouter.get(["/api/auth/verify", "/auth/verify"], handleVerify);
