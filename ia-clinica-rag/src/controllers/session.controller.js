import { query } from "../config/database.js";
import { OrchestratorAgent } from "../agents/orchestrator.agent.js";
import crypto from "node:crypto";

const memorySessionsMap = new Map();

export async function handleCreateSession(req, res) {
  const { agentId = "general_medicine", clinicalContext = {} } = req.body || {};

  try {
    const result = await query(
      `
        INSERT INTO clinical_sessions (agent_id, clinical_context)
        VALUES ($1, $2)
        RETURNING id, agent_id, status, created_at
      `,
      [agentId, JSON.stringify(clinicalContext)]
    );

    return res.status(201).json({
      status: "success",
      session: result.rows[0]
    });
  } catch (error) {
    // Fallback resiliente em memória
    const sessionId = crypto.randomUUID();
    const fallbackSession = {
      id: sessionId,
      agent_id: agentId,
      status: "active",
      clinical_context: clinicalContext,
      created_at: new Date().toISOString()
    };
    memorySessionsMap.set(sessionId, fallbackSession);

    return res.status(201).json({
      status: "success",
      session: fallbackSession
    });
  }
}

export async function handleListSessions(req, res) {
  try {
    const result = await query(
      `
        SELECT 
          s.id,
          s.agent_id,
          s.status,
          s.created_at,
          s.updated_at,
          (SELECT text FROM conversation_messages WHERE session_id = s.id AND sender = 'user' ORDER BY created_at ASC LIMIT 1) as initial_complaint,
          (SELECT COUNT(*) FROM conversation_messages WHERE session_id = s.id) as message_count,
          (SELECT COUNT(*) FROM physician_decisions WHERE session_id = s.id) as decision_count
        FROM clinical_sessions s
        ORDER BY s.updated_at DESC
        LIMIT 20
      `
    );

    return res.status(200).json({
      status: "success",
      sessions: result.rows
    });
  } catch (error) {
    // Retornar sessões em memória
    return res.status(200).json({
      status: "success",
      sessions: Array.from(memorySessionsMap.values())
    });
  }
}

export async function handleGetSession(req, res) {
  try {
    const { id } = req.params;

    const sessionRes = await query(`SELECT * FROM clinical_sessions WHERE id = $1`, [id]);

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Sessão clínica não encontrada."
      });
    }

    const messagesRes = await query(
      `SELECT * FROM conversation_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const decisionsRes = await query(
      `SELECT * FROM clinical_decisions WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const physicianDecisionsRes = await query(
      `SELECT * FROM physician_decisions WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // Gerar Síntese de Retomada do Caso (P2.2) caso existam mensagens anteriores
    let resumeSummary = null;
    if (messagesRes.rows.length > 0) {
      const userMessages = messagesRes.rows.filter(m => m.sender === 'user');
      const firstComplaint = userMessages[0]?.text || "Queixa clínica não especificada";
      const lastState = userMessages[userMessages.length - 1]?.text || "";
      const decisionsCount = physicianDecisionsRes.rows.length;

      resumeSummary = {
        title: `Retomada do Caso Clínico #${id.slice(0, 8)}`,
        initialComplaint: firstComplaint,
        lastState,
        totalTurns: messagesRes.rows.length,
        recordedDecisionsCount: decisionsCount,
        summaryText: `Caso iniciado com queixa de "${firstComplaint.slice(0, 100)}...". Total de ${messagesRes.rows.length} turnos discutidos e ${decisionsCount} condutas registradas no prontuário.`,
        suggestedNextSteps: [
          "Avaliar resposta ao tratamento prescrito na consulta anterior",
          "Investigar exames complementares pendentes",
          "Reavaliar sinais de alerta ou novas queixas trazidas pelo paciente"
        ]
      };
    }

    return res.status(200).json({
      status: "success",
      session: sessionRes.rows[0],
      messages: messagesRes.rows,
      decisions: decisionsRes.rows,
      physicianDecisions: physicianDecisionsRes.rows,
      resumeSummary
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao recuperar sessão clínica.",
      detail: error.message
    });
  }
}

export async function handleAnalyzeCase(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID da sessão é obrigatório."
      });
    }

    const result = await OrchestratorAgent.analyzeFullCase({ sessionId: id });
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erro ao analisar caso clínico completo:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao gerar a análise consolidada do caso.",
      detail: error.message
    });
  }
}

/**
 * Registro de Escolha de Conduta do Médico (Rastreabilidade Médico-Legal)
 */
export async function handleRecordPhysicianDecision(req, res) {
  try {
    const { id } = req.params;
    const { chosenConduct, supportingSources = [], rationale = "", physicianNotes = "" } = req.body;

    if (!id || !chosenConduct) {
      return res.status(400).json({
        status: "error",
        message: "ID da sessão e conduta escolhida (chosenConduct) são obrigatórios."
      });
    }

    const result = await query(
      `
        INSERT INTO physician_decisions (session_id, chosen_conduct, supporting_sources, rationale, physician_notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, session_id, chosen_conduct, supporting_sources, rationale, created_at
      `,
      [id, chosenConduct, JSON.stringify(supportingSources), rationale, physicianNotes]
    );

    // Também registrar no Log de Auditoria Audit_Logs
    await query(
      `
        INSERT INTO audit_logs (event_type, session_id, user_action, details)
        VALUES ($1, $2, $3, $4)
      `,
      [
        "PHYSICIAN_DECISION_RECORDED",
        id,
        "CONFIRM_CLINICAL_CONDUCT",
        JSON.stringify({
          chosenConduct,
          supportingSourcesCount: supportingSources.length,
          timestamp: new Date().toISOString()
        })
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Decisão clínica do médico registrada com sucesso para auditoria médico-legal.",
      record: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao registrar decisão do médico:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao registrar decisão médico-legal.",
      detail: error.message
    });
  }
}
