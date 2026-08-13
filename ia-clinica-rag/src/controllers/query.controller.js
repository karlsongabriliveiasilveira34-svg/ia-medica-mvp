import { OrchestratorAgent } from "../agents/orchestrator.agent.js";

export async function handleQuery(req, res) {
  try {
    const { question, specialty = "auto", topK = 5, minSimilarity = 0.5, sessionId = null } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "O campo 'question' é obrigatório e deve ser um texto válido."
      });
    }

    const result = await OrchestratorAgent.processQuery({
      question: question.trim(),
      specialty,
      topK: Number(topK),
      minSimilarity: Number(minSimilarity),
      sessionId
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erro ao processar consulta RAG Clínica:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha interna ao processar a consulta médica. Nenhuma recomendação foi gerada sem validação das fontes.",
      detail: error.message
    });
  }
}
