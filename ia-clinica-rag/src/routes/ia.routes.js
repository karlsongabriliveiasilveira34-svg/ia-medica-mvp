import { Router } from "express";
import { IaPreceptoraService } from "../services/ia-preceptora.service.js";
import { aiQueryLimiter } from "../middleware/rate-limiter.middleware.js";
import { inputSecurityMiddleware } from "../middleware/security-sanitizer.middleware.js";
import { usageMeterService } from "../services/usage-meter.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const iaRouter = Router();

// Rota principal do Chat com a IA Preceptora / Copiloto
iaRouter.post(["/api/ia/chat", "/api/ia", "/ia/chat"], authenticate, aiQueryLimiter, inputSecurityMiddleware, async (req, res) => {
  try {
    const { mensagem, question, modo = "medico", conversationId, historico } = req.body;
    const userMessage = mensagem || question;

    if (!userMessage) {
      return res.status(400).json({ status: "error", message: "Mensagem obrigatória." });
    }

    const userId = req.user?.id || req.user?.userId || req.ip || "anonimo";
    const userPlan = req.user?.plan || "free";

    // Validar cota mensal do plano (Plano Free: 10 requisições de IA/mês)
    const limitCheck = usageMeterService.checkResourceLimit(userId, userPlan, "ai");
    if (!limitCheck.allowed) {
      return res.status(403).json({
        status: "error",
        code: "LIMIT_REACHED",
        resource: "ai",
        limit: limitCheck.limit,
        used: limitCheck.used,
        remaining: 0,
        resetAt: limitCheck.resetAt,
        message: limitCheck.message
      });
    }

    const result = await IaPreceptoraService.processChat({
      mensagem: userMessage,
      modo,
      conversationId,
      userId,
      historico
    });

    // Registrar consumo no backend
    usageMeterService.recordResourceUsage(userId, userPlan, "ai", 1);

    return res.json({
      status: "success",
      answer: result.resposta,
      resposta: result.resposta,
      modo: result.modo,
      conversationId: result.conversationId,
      timestamp: result.timestamp
    });
  } catch (err) {
    console.error("[IA ROUTE] Erro ao processar mensagem:", err);
    return res.status(500).json({ status: "error", message: "Erro ao processar resposta com a IA." });
  }
});
