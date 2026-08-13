import { query } from "../config/database.js";

export async function handleSaveFeedback(req, res) {
  try {
    const { decisionId, rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        status: "error",
        message: "O campo 'rating' é obrigatório."
      });
    }

    const result = await query(
      `
        INSERT INTO physician_feedback (decision_id, rating, comment)
        VALUES ($1, $2, $3)
        RETURNING id, rating, created_at
      `,
      [decisionId || null, rating, comment || null]
    );

    return res.status(201).json({
      status: "success",
      message: "Feedback registrado com sucesso!",
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao salvar feedback:", error);
    return res.status(500).json({
      status: "error",
      message: "Falha ao registrar feedback.",
      detail: error.message
    });
  }
}
