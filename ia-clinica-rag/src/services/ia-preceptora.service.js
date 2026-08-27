import { OrchestratorAgent } from "../agents/orchestrator.agent.js";
import { pool } from "../config/database.js";

/**
 * Serviço da IA Preceptora Acadêmica (MedIa v2.0)
 * Reutiliza 100% da infraestrutura, RAG clínico e modelo de IA central (OrchestratorAgent),
 * operando no modo pedagógico acadêmico ('student').
 */
export class IaPreceptoraService {
  /**
   * Processa mensagem acadêmica/clínica com o orquestrador central de IA
   */
  static async processChat({ mensagem, modo = "estudante", conversationId = null, userId = null, historico = [] }) {
    const textoLimpo = (mensagem || "").trim();

    // 1. Resposta rápida para saudações iniciais
    const saudacoes = ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "hey", "hello"];
    if (saudacoes.includes(textoLimpo.toLowerCase())) {
      const saudacaoResposta = (modo === "estudante" || modo === "student")
        ? "Olá! Sou sua IA Preceptora Acadêmica. Qual conceito fisiopatológico, tema de prova (ENARE/Revalida) ou dúvida clínica posso te ajudar a revisar hoje?"
        : "Olá, Doutor(a)! Como posso apoiar sua conduta ou raciocínio clínico no caso de hoje?";

      return {
        resposta: saudacaoResposta,
        modo,
        conversationId: conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }

    const targetUserMode = (modo === "estudante" || modo === "student") ? "student" : "doctor";
    const sessionId = conversationId || `preceptora-${Date.now()}`;

    // 2. Processar consulta diretamente pelo Orquestrador Clínico Principal do MedIA
    const orchestratorResult = await OrchestratorAgent.processQuery({
      question: textoLimpo,
      specialty: "auto",
      topK: 100,
      deepResearch: false,
      sessionId,
      userMode: targetUserMode
    });

    const respostaFinal = orchestratorResult.answer || "Não foi possível gerar a resposta acadêmica no momento.";

    // 3. Persistir no banco de dados se conectado
    try {
      if (userId) {
        let convId = conversationId;
        if (!convId) {
          const convRes = await pool.query(
            "INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id",
            [userId, textoLimpo.slice(0, 50)]
          );
          convId = convRes.rows[0]?.id;
        }

        if (convId) {
          await pool.query(
            "INSERT INTO messages (conversation_id, user_id, role, content) VALUES ($1, $2, 'user', $3), ($1, $2, 'assistant', $4)",
            [convId, userId, textoLimpo, respostaFinal]
          );
        }
      }
    } catch (dbErr) {
      console.warn("[IA PRECEPTORA] Aviso ao persistir conversa no banco:", dbErr.message);
    }

    return {
      resposta: respostaFinal,
      citations: orchestratorResult.citations || [],
      differentialDiagnoses: orchestratorResult.differentialDiagnoses || [],
      modo: targetUserMode,
      conversationId: sessionId,
      timestamp: new Date().toISOString()
    };
  }
}
