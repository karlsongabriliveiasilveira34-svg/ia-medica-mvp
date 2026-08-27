import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthSecurityService } from "../services/auth-security.service.js";

const JWT_SECRET = env.jwtSecret || process.env.JWT_SECRET || "ia-clinica-secret-key-2026";

/**
 * 1. Middleware de Autenticação Geral
 * Extrai e valida o token JWT do header Authorization.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];

  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Token inválido ou expirado
    req.user = null;
    next();
  }
}

/**
 * 2. Middleware Estrito de Autenticação Obrigatória
 * Bloqueia acessos não autenticados com HTTP 401 Unauthorized.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      code: "AUTH_REQUIRED",
      message: "Acesso restrito. Faça login para continuar."
    });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn("[AUTH][ERROR] Token inválido ou expirado:", err.message);
    return res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Sua sessão expirou ou o token é inválido. Por favor, faça login novamente."
    });
  }
}

/**
 * 3. Middleware de Verificação de Email Obrigatória
 * Bloqueia usuários com email não confirmado de acessar recursos protegidos.
 */
export function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      code: "AUTH_REQUIRED",
      message: "Acesso restrito. Faça login para continuar."
    });
  }

  if (req.user.email_verificado === false) {
    console.warn(`[AUTH][ERROR] Acesso bloqueado para ${req.user.email}: email não verificado.`);
    return res.status(403).json({
      status: "error",
      code: "EMAIL_NOT_VERIFIED",
      message: "Seu email ainda não foi verificado. Por favor, clique no link de ativação enviado para sua caixa de entrada.",
      email: req.user.email
    });
  }

  next();
}

/**
 * 4. Middleware de Tiers e Planos (Free, Estudante, Clínica, Médico)
 * Impede que usuários no plano Free/Estudante acessem recursos médicos avançados sem plano.
 */
export function requirePlan(allowedPlans = ["medico"]) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        code: "AUTH_REQUIRED",
        message: "Acesso restrito. Faça login para continuar."
      });
    }

    const userPlan = (req.user.plan || "free").toLowerCase();
    const isAllowed = allowedPlans.map(p => p.toLowerCase()).includes(userPlan) || userPlan === "medico";

    if (!isAllowed) {
      console.warn(`[AUTH][ERROR] Acesso negado para plano '${userPlan}' na rota restrita aos planos: [${allowedPlans.join(", ")}]`);
      return res.status(403).json({
        status: "error",
        code: "PLAN_UPGRADE_REQUIRED",
        message: `Esta funcionalidade requer o ${allowedPlans.join(" ou ")}. Faça upgrade ou resgate seu cupom promocional!`,
        currentPlan: userPlan,
        requiredPlans: allowedPlans
      });
    }

    next();
  };
}

/**
 * 5. Middleware de Controle de Papéis (Admin, Médico, Professor, Estudante)
 */
export function requireRole(allowedRoles = ["medico", "admin"]) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        code: "AUTH_REQUIRED",
        message: "Acesso restrito. Faça login para continuar."
      });
    }

    const userRole = (req.user.role || req.user.app_mode || req.user.plan || "estudante").toLowerCase();
    const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(userRole) || userRole === "admin";

    if (!isAllowed) {
      return res.status(403).json({
        status: "error",
        code: "INSUFFICIENT_PERMISSIONS",
        message: "Você não possui permissão para acessar esta área.",
        currentRole: userRole
      });
    }

    next();
  };
}
