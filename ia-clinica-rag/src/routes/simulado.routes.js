import { Router } from "express";
import { pool, ensureUsersSchema } from "../config/database.js";
import { INITIAL_QUESTIONS } from "../../frontend/src/data/medicalQuestionsAndCards.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const simuladoRouter = Router();

// Armazenamento em memoria para fallback offline
let memoryQuizHistory = [];

/**
 * 1. OBTER ACERVO OFICIAL DE 50 QUESTOES DO SIMULADO
 */
simuladoRouter.get(
  ["/api/simulado/questions", "/simulado/questions"],
  authenticate,
  async (req, res) => {
    try {
      await ensureUsersSchema();
      const count = Number.parseInt(req.query.count, 10) || 50;

      // Buscar do PostgreSQL se disponivel
      try {
        const dbRes = await pool.query(
          "SELECT id, banca, especialidade, tema, dificuldade, enunciado, alternativas, resposta_correta, explicacao FROM questoes ORDER BY id ASC LIMIT $1",
          [count]
        );

        if (dbRes.rows && dbRes.rows.length >= 50) {
          const formatted = dbRes.rows.map((q, idx) => ({
            id: q.id || idx + 1,
            exam: q.banca || 'ENARE Oficial',
            area: (q.especialidade || 'clinica').toLowerCase(),
            topic: q.tema || 'Geral',
            question: q.enunciado,
            options: typeof q.alternativas === 'string' ? JSON.parse(q.alternativas) : q.alternativas,
            correct: q.resposta_correta !== undefined ? q.resposta_correta : 0,
            explanation: q.explicacao
          }));

          return res.json({
            status: "success",
            total: formatted.length,
            questions: formatted,
            data: formatted
          });
        }
      } catch (dbErr) {
        console.warn("[SIMULADO] Consulta PostgreSQL em fallback para 50 questoes em memoria:", dbErr.message);
      }

      // Fallback garantido: 50 questoes de INITIAL_QUESTIONS
      return res.json({
        status: "success",
        total: INITIAL_QUESTIONS.length,
        questions: INITIAL_QUESTIONS,
        data: INITIAL_QUESTIONS
      });
    } catch (err) {
      console.error("[SIMULADO] Erro ao carregar questoes:", err.message);
      return res.status(500).json({ status: "error", message: "Erro ao carregar simulado." });
    }
  }
);

/**
 * 2. SUBMETER E CORRIGIR SIMULADO (PONTUACAO + RELATORIO POR TEMA)
 */
simuladoRouter.post(
  ["/api/simulado/submit", "/simulado/submit"],
  authenticate,
  async (req, res) => {
    try {
      await ensureUsersSchema();
      const userId = req.user?.id || req.user?.userId || "anonimo";
      const userEmail = req.user?.email || "estudante@media.med.br";
      const { answers = {}, durationSeconds = 0, questionsList = null } = req.body;

      // Questoes de referencia (da requisicao ou do banco padrao)
      const baseQuestions = Array.isArray(questionsList) && questionsList.length > 0
        ? questionsList
        : INITIAL_QUESTIONS;

      let score = 0;
      const themeStats = {};
      const results = [];

      baseQuestions.forEach((q, idx) => {
        const userAnswer = answers[idx] !== undefined ? answers[idx] : answers[q.id];
        const isAnswered = userAnswer !== undefined && userAnswer !== null;
        const correctAnswer = q.correct !== undefined ? q.correct : q.resposta_correta;
        const isCorrect = isAnswered && Number(userAnswer) === Number(correctAnswer);

        if (isCorrect) {
          score += 1;
        }

        // Estatisticas por especialidade / area
        const areaKey = (q.area || q.especialidade || "clinica").toLowerCase();
        if (!themeStats[areaKey]) {
          themeStats[areaKey] = {
            name: getAreaDisplayName(areaKey),
            total: 0,
            correct: 0,
            wrong: 0,
            percentage: 0
          };
        }

        themeStats[areaKey].total += 1;
        if (isCorrect) {
          themeStats[areaKey].correct += 1;
        } else {
          themeStats[areaKey].wrong += 1;
        }

        results.push({
          questionIndex: idx,
          questionId: q.id,
          topic: q.topic || q.tema || "Geral",
          area: areaKey,
          userAnswer: isAnswered ? Number(userAnswer) : null,
          correctAnswer: Number(correctAnswer),
          isCorrect,
          explanation: q.explanation || q.explicacao || ""
        });
      });

      // Calcular percentuais por tema
      Object.keys(themeStats).forEach(k => {
        const t = themeStats[k];
        t.percentage = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      });

      const totalQuestions = baseQuestions.length;
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100 * 10) / 10 : 0;

      const submissionRecord = {
        id: `sim_${Date.now()}`,
        userId,
        userEmail,
        score,
        totalQuestions,
        percentage,
        answers,
        themeStats,
        durationSeconds: durationSeconds || 0,
        createdAt: new Date().toISOString()
      };

      // Persistir no PostgreSQL
      try {
        const insertSql = `
          INSERT INTO quiz_history (user_id, user_email, score, total_questions, percentage, answers, theme_stats, duration_seconds, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING id, created_at
        `;
        const dbRes = await pool.query(insertSql, [
          userId,
          userEmail,
          score,
          totalQuestions,
          percentage,
          JSON.stringify(answers),
          JSON.stringify(themeStats),
          durationSeconds
        ]);

        if (dbRes.rows.length > 0) {
          submissionRecord.id = dbRes.rows[0].id;
          submissionRecord.createdAt = dbRes.rows[0].created_at;
        }
      } catch (dbErr) {
        console.warn("[SIMULADO] Insert quiz_history em fallback para memoria:", dbErr.message);
      }

      memoryQuizHistory.unshift(submissionRecord);

      return res.json({
        status: "success",
        submissionId: submissionRecord.id,
        score,
        totalQuestions,
        percentage,
        themeStats,
        results,
        durationSeconds,
        timestamp: submissionRecord.createdAt
      });
    } catch (err) {
      console.error("[SIMULADO] Erro ao corrigir simulado:", err.message);
      return res.status(500).json({ status: "error", message: "Erro ao processar simulado." });
    }
  }
);

/**
 * 3. HISTORICO DE SIMULADOS DO ESTUDANTE
 */
simuladoRouter.get(
  ["/api/simulado/history", "/simulado/history"],
  authenticate,
  async (req, res) => {
    try {
      await ensureUsersSchema();
      const userId = req.user?.id || req.user?.userId || null;
      const userEmail = req.user?.email || null;

      try {
        let sql = "SELECT * FROM quiz_history WHERE 1=1";
        const params = [];
        if (userId) {
          params.push(userId);
          sql += ` AND (user_id = $${params.length} OR user_email = $${params.length})`;
        } else if (userEmail) {
          params.push(userEmail);
          sql += ` AND user_email = $${params.length}`;
        }
        sql += " ORDER BY created_at DESC LIMIT 20";

        const dbRes = await pool.query(sql, params);
        if (dbRes.rows && dbRes.rows.length > 0) {
          const history = dbRes.rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            userEmail: r.user_email,
            score: r.score,
            totalQuestions: r.total_questions,
            percentage: Number.parseFloat(r.percentage),
            themeStats: typeof r.theme_stats === 'string' ? JSON.parse(r.theme_stats) : r.theme_stats,
            durationSeconds: r.duration_seconds,
            createdAt: r.created_at
          }));

          return res.json({
            status: "success",
            history,
            data: history
          });
        }
      } catch (dbErr) {
        console.warn("[SIMULADO] Historico PostgreSQL em fallback:", dbErr.message);
      }

      const filtered = memoryQuizHistory.filter(h => !userId || h.userId === userId || h.userEmail === userEmail);
      return res.json({
        status: "success",
        history: filtered,
        data: filtered
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

function getAreaDisplayName(areaKey) {
  const map = {
    clinica: "Clinica Medica",
    cirurgia: "Cirurgia Geral & Trauma",
    pediatria: "Pediatria & Puericultura",
    go: "Ginecologia & Obstetricia",
    preventiva: "Medicina Preventiva & SUS"
  };
  return map[areaKey] || "Clinica Medica";
}
