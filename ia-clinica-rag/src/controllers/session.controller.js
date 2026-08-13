import { query } from "../config/database.js";

export async function handleCreateSession(req, res) {
  try {
    const { agentId = "general_medicine", clinicalContext = {} } = req.body;

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
    return res.status(500).json({
      status: "error",
      message: "Falha ao criar sessão clínica.",
      detail: error.message
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

    const decisionsRes = await query(
      `SELECT * FROM clinical_decisions WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    return res.status(200).json({
      status: "success",
      session: sessionRes.rows[0],
      decisions: decisionsRes.rows
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao recuperar sessão clínica.",
      detail: error.message
    });
  }
}
