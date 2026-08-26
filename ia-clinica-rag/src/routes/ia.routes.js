import { Router } from "express";
import { IaPreceptoraService } from "../services/ia-preceptora.service.js";
import { aiQueryLimiter } from "../middleware/rate-limiter.middleware.js";
import { inputSecurityMiddleware } from "../middleware/security-sanitizer.middleware.js";

export const iaRouter = Router();

// Rota principal do Chat com a IA Preceptora / Copiloto
iaRouter.post(["/api/ia/chat", "/api/ia", "/ia/chat"], aiQueryLimiter, inputSecurityMiddleware, async (req, res) => {
  try {
    const { mensagem, question, modo = "medico", conversationId, historico } = req.body;
    const userMessage = mensagem || question;

    if (!userMessage) {
      return res.status(400).json({ status: "error", message: "Mensagem obrigatória." });
    }

    const userId = req.user?.id || null;
    const result = await IaPreceptoraService.processChat({
      mensagem: userMessage,
      modo,
      conversationId,
      userId,
      historico
    });

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
