import { OrchestratorAgent } from "../agents/orchestrator.agent.js";
import { getAgentById } from "../config/agents.config.js";
import { query } from "../config/database.js";
import { processAndSanitizeImage } from "../utils/image-sanitizer.util.js";
import { usageMeterService } from "../services/usage-meter.service.js";

function extractImagePayload(file, imageBase64, imageDataUrl) {
  if (file) {
    const sanitized = processAndSanitizeImage(file.buffer);
    return { mimeType: sanitized.mimeType, base64Data: sanitized.base64Data };
  }
  let rawBase64 = typeof imageBase64 === "string" ? imageBase64 : (typeof imageDataUrl === "string" ? imageDataUrl : "");
  if (rawBase64.includes(";base64,")) {
    rawBase64 = rawBase64.split(";base64,")[1];
  }
  if (rawBase64) {
    const buffer = Buffer.from(rawBase64, "base64");
    const sanitized = processAndSanitizeImage(buffer);
    return { mimeType: sanitized.mimeType, base64Data: sanitized.base64Data };
  }
  return null;
}

async function getOrCreateSessionId(sessionId, specialty, finalQuestion, userMode, hasImage) {
  if (sessionId) return sessionId;
  try {
    const resolvedAgent = getAgentById(specialty);
    const sessionRes = await query(
      `INSERT INTO clinical_sessions (agent_id, clinical_context) VALUES ($1, $2) RETURNING id`,
      [resolvedAgent.id, JSON.stringify({ initialQuestion: finalQuestion, userMode, hasImage })]
    );
    return sessionRes.rows[0]?.id || `session-${Date.now()}`;
  } catch (sessErr) {
    console.warn("⚠️ Aviso ao criar sessão no banco:", sessErr.message);
    return `session-${Date.now()}`;
  }
}

async function persistConversationAndDecisions(sessionId, finalQuestion, imagePayload, result, specialty) {
  try {
    await query(
      `INSERT INTO conversation_messages (session_id, sender, text, metadata) VALUES ($1, $2, $3, $4)`,
      [sessionId, 'user', finalQuestion, JSON.stringify({ hasImage: !!imagePayload, imageMimeType: imagePayload?.mimeType || null })]
    );

    await query(
      `INSERT INTO conversation_messages (session_id, sender, text, citations, metadata) VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, 'bot', result.answer, JSON.stringify(result.citations || []), JSON.stringify({ agent: result.agent, latencyMs: result.metadata?.latencyMs, hasImage: !!imagePayload })]
    );

    await query(
      `INSERT INTO clinical_decisions (session_id, question, agent_id, response_text, confidence_score, citations, differential_diagnoses) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, finalQuestion, result.agent?.id || specialty, result.answer, result.confidence?.score || 0.9, JSON.stringify(result.citations || []), JSON.stringify(result.differentialDiagnoses || [])]
    );
  } catch (err) {
    console.warn("⚠️ Aviso ao salvar resposta da IA no banco:", err.message);
  }
}

export async function handleQuery(req, res) {
  try {
    const { question = "", specialty = "auto", topK, deepResearch = false, isDeepResearch = false, minSimilarity = 0.4, sessionId: rawSessionId = null, userMode = "doctor", imageBase64, imageDataUrl } = req.body || {};

    const userId = req.user?.id || req.user?.userId || req.ip || "anonimo";
    const userPlan = req.user?.plan || "free";

    // 0. Validar cota mensal de IA
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

    const activeDeepResearch = Boolean(deepResearch || isDeepResearch);
    const finalTopK = Number(topK) || (activeDeepResearch ? 200 : 100);

    let imagePayload = null;
    try {
      imagePayload = extractImagePayload(req.file, imageBase64, imageDataUrl);
    } catch (imgErr) {
      return res.status(400).json({ status: "error", message: imgErr.message });
    }

    const cleanQuestion = typeof question === "string" ? question.trim() : "";
    if (!cleanQuestion && !imagePayload) {
      return res.status(400).json({
        status: "error",
        message: "Forneça uma pergunta em texto ou anexe uma imagem clínica (JPG/PNG) para análise."
      });
    }

    const finalQuestion = cleanQuestion || "Análise médica integrativa dos achados visuais da imagem anexada.";
    const sessionId = await getOrCreateSessionId(rawSessionId, specialty, finalQuestion, userMode, !!imagePayload);

    const result = await OrchestratorAgent.processQuery({
      question: finalQuestion,
      specialty,
      topK: finalTopK,
      deepResearch: activeDeepResearch,
      minSimilarity: Number(minSimilarity),
      sessionId,
      userMode,
      imagePayload
    });

    await persistConversationAndDecisions(sessionId, finalQuestion, imagePayload, result, specialty);
    usageMeterService.recordResourceUsage(userId, userPlan, "ai", 1);

    return res.status(200).json({ ...result, sessionId });
  } catch (error) {
    console.error("❌ Erro ao processar consulta RAG Clínica Multimodal:", error);
    const isRateLimit = error.status === 429 || error.message?.includes("429") || error.message?.includes("quota");
    
    if (isRateLimit) {
      return res.status(429).json({
        status: "error",
        message: "O serviço de inteligência médica está com alta demanda momentânea. Por favor, aguarde 10 segundos e tente novamente.",
        detail: "RATE_LIMIT_EXCEEDED"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Falha interna ao processar a consulta médica com visão computacional.",
      detail: error.message
    });
  }
}
