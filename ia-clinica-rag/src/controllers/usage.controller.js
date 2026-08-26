import { usageMeterService, PLANS_CONFIG } from "../services/usage-meter.service.js";
import { googleAuthService } from "../services/google-auth.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

/**
 * Controller de Consumo de Requisições, Tokens e Gestão de Planos
 * Inclui logging estruturado seguro e proteção de sessão.
 */
export async function getUserUsageHandler(req, res) {
  console.log(`[USER_USAGE] request: ${req.method} ${req.originalUrl}`);
  try {
    let user = req.user;

    // Se não populado pelo middleware, tentar extrair do header Authorization
    if (!user) {
      const authHeader = req.headers.authorization || req.headers["x-auth-token"];
      if (authHeader) {
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        try {
          user = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
          // Token inválido
          user = null;
        }
      }
    }

    if (!user) {
      console.log("[USER_USAGE] unauthenticated");
      console.log("[USER_USAGE] response: 401 Unauthorized");
      return res.status(401).json({
        status: "error",
        code: "UNAUTHORIZED",
        message: "Autenticação necessária para consultar consumo da conta."
      });
    }

    console.log("[USER_USAGE] authenticated");
    const userId = user.userId || user.id || user.email;
    console.log(`[USER_USAGE] userId: ${userId}`);

    console.log("[USER_USAGE] database query");
    // Obter plano do usuário
    let planId = user.plan || "free";
    const userRecord = googleAuthService.getUserById(userId);
    if (userRecord && userRecord.plan) {
      planId = userRecord.plan;
    }

    const usageSummary = usageMeterService.getUsageSummary(userId, planId);
    console.log(`[USER_USAGE] query result (Plan: ${planId}, Requests: ${usageSummary.usage.requestsUsed}/${usageSummary.usage.requestsLimit})`);
    console.log("[USER_USAGE] response: 200 OK");

    return res.json({
      status: "success",
      data: usageSummary
    });
  } catch (err) {
    console.error("[USER_USAGE][ERROR]:", err.message);
    console.log("[USER_USAGE] response: 500 Internal Server Error");
    return res.status(500).json({ status: "error", message: "Falha interna ao calcular dados de uso da conta." });
  }
}

export async function upgradePlanHandler(req, res) {
  console.log(`[USER_USAGE] upgrade request: ${req.method} ${req.originalUrl}`);
  try {
    const { planType } = req.body || {};
    const authHeader = req.headers.authorization;
    let user = req.user;

    if (!user && authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      return res.status(401).json({ status: "error", message: "Autenticação obrigatória." });
    }

    if (!PLANS_CONFIG[planType]) {
      return res.status(400).json({
        status: "error",
        message: `Plano "${planType}" inválido. Escolha entre: free, estudante, clinica, medico.`
      });
    }

    const userId = user.userId || user.id || user.email;
    const userRecord = googleAuthService.getUserById(userId);
    if (userRecord) {
      userRecord.plan = planType;
    }

    const updatedSummary = usageMeterService.getUsageSummary(userId, planType);
    console.log(`[USER_USAGE] Plano atualizado para ${planType} (User: ${userId})`);

    return res.json({
      status: "success",
      message: `Plano atualizado com sucesso para ${PLANS_CONFIG[planType].name}!`,
      data: updatedSummary
    });
  } catch (err) {
    console.error("[USER_USAGE][ERROR]:", err.message);
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function listPlansHandler(req, res) {
  try {
    return res.json({
      status: "success",
      plans: Object.values(PLANS_CONFIG)
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
