import { OrchestratorAgent } from "../agents/orchestrator.agent.js";
import { getAgentById } from "../config/agents.config.js";
import { query } from "../config/database.js";
import { processAndSanitizeImage } from "../utils/image-sanitizer.util.js";

export async function handleQuery(req, res) {
  try {
    let { question = "", specialty = "auto", topK, deepResearch = false, isDeepResearch = false, minSimilarity = 0.4, sessionId = null, userMode = "doctor", imageBase64, imageDataUrl } = req.body || {};

    const activeDeepResearch = Boolean(deepResearch || isDeepResearch);
    const defaultTopK = activeDeepResearch ? 200 : 100;
    const finalTopK = Number(topK) || defaultTopK;

    let imagePayload = null;

    // 1. Processar upload de imagem (seja via Multer req.file ou Payload Base64 JSON)
    if (req.file) {
      try {
        const sanitized = processAndSanitizeImage(req.file.buffer);
        imagePayload = {
          mimeType: sanitized.mimeType,
          base64Data: sanitized.base64Data
        };
      } catch (imgErr) {
        return res.status(400).json({
          status: "error",
          message: imgErr.message
        });
      }
    } else if (imageBase64 || imageDataUrl) {
      try {
        let rawBase64 = imageBase64 || imageDataUrl;
        if (rawBase64.includes(";base64,")) {
          rawBase64 = rawBase64.split(";base64,")[1];
        }
        const buffer = Buffer.from(rawBase64, "base64");
        const sanitized = processAndSanitizeImage(buffer);
        imagePayload = {
          mimeType: sanitized.mimeType,
          base64Data: sanitized.base64Data
        };
      } catch (imgErr) {
        return res.status(400).json({
          status: "error",
          message: imgErr.message
        });
      }
    }

    // 2. Validar que ao menos pergunta em texto ou imagem foi fornecida
    const cleanQuestion = typeof question === "string" ? question.trim() : "";
    if (!cleanQuestion && !imagePayload) {
      return res.status(400).json({
        status: "error",
        message: "Forneça uma pergunta em texto ou anexe uma imagem clínica (JPG/PNG) para análise."
      });
    }

    const finalQuestion = cleanQuestion || "Análise médica integrativa dos achados visuais da imagem anexada.";

    // 3. Criar nova sessão se não fornecida
    if (!sessionId) {
      const resolvedAgent = getAgentById(specialty);
      const sessionRes = await query(
        `INSERT INTO clinical_sessions (agent_id, clinical_context) VALUES ($1, $2) RETURNING id`,
        [resolvedAgent.id, JSON.stringify({ initialQuestion: finalQuestion, userMode, hasImage: !!imagePayload })]
      );
      sessionId = sessionRes.rows[0]?.id;
    }

    // 4. Processar consulta via Orquestrador Clínico Multimodal
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

    // 5. Persistir mensagem do Usuário e resposta da IA na sessão em ordem cronológica estrita
    try {
      await query(
        `INSERT INTO conversation_messages (session_id, sender, text, metadata) VALUES ($1, $2, $3, $4)`,
        [
          sessionId, 
          'user', 
          finalQuestion, 
          JSON.stringify({ hasImage: !!imagePayload, imageMimeType: imagePayload?.mimeType || null })
        ]
      );

      await query(
        `INSERT INTO conversation_messages (session_id, sender, text, citations, metadata) VALUES ($1, $2, $3, $4, $5)`,
        [
          sessionId,
          'bot',
          result.answer,
          JSON.stringify(result.citations || []),
          JSON.stringify({ agent: result.agent, latencyMs: result.metadata?.latencyMs, hasImage: !!imagePayload })
        ]
      );

      await query(
        `INSERT INTO clinical_decisions (session_id, question, agent_id, response_text, confidence_score, citations, differential_diagnoses) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          finalQuestion,
          result.agent?.id || specialty,
          result.answer,
          result.confidence?.score || 0.9,
          JSON.stringify(result.citations || []),
          JSON.stringify(result.differentialDiagnoses || [])
        ]
      );
    } catch (err) {
      console.warn("⚠️ Aviso ao salvar resposta da IA no banco:", err.message);
    }

    return res.status(200).json({
      ...result,
      sessionId
    });
  } catch (error) {
    console.error("❌ Erro ao processar consulta RAG Clínica Multimodal:", error);
    const isRateLimit = error.status === 429 || (error.message && error.message.includes("429")) || (error.message && error.message.includes("quota"));
    
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
