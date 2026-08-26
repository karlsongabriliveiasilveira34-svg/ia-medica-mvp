import { Router } from "express";
import { QuestoesGeneratorService } from "../services/questoes-generator.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const questoesRouter = Router();

// 1. LISTAGEM DE QUESTÕES COM PAGINAÇÃO E FILTROS REAIS
questoesRouter.get(["/api/questoes", "/questoes", "/api/questions", "/questions"], authenticate, async (req, res) => {
  try {
    const { especialidade, tema, banca, dificuldade, status, page, limit } = req.query;
    const userId = req.user?.id || req.user?.userId || null;

    const resultado = await QuestoesGeneratorService.listQuestions({
      especialidade,
      tema,
      banca,
      dificuldade,
      status,
      userId,
      page,
      limit
    });

    return res.json({
      status: "success",
      total: resultado.total,
      count: resultado.questoes.length,
      page: resultado.page,
      limit: resultado.limit,
      hasNext: resultado.hasNext,
      questoes: resultado.questoes
    });
  } catch (err) {
    console.error("[QUESTOES ROUTE][ERROR] Erro ao listar questões:", err.message);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 2. REGISTRAR RESPOSTA DO ESTUDANTE (HISTÓRICO REAL)
questoesRouter.post(
  ["/api/questoes/responder", "/questoes/responder", "/api/questoes/resposta", "/api/questions/:id/answer"],
  authenticate,
  async (req, res) => {
    try {
      const questaoId = req.params.id || req.body.questaoId || req.body.questionId;
      const { alternativaSelecionada, selectedOption, tempoSegundos } = req.body;
      const altIndex = alternativaSelecionada !== undefined ? alternativaSelecionada : selectedOption;

      if (!questaoId || altIndex === undefined) {
        return res.status(400).json({
          status: "error",
          message: "ID da questão e alternativa selecionada são obrigatórios."
        });
      }

      const userId = req.user?.id || req.user?.userId || "anonimo";
      const userEmail = req.user?.email || "anonimo@media.med.br";

      const resultado = await QuestoesGeneratorService.recordAnswer({
        userId,
        userEmail,
        questaoId,
        alternativaSelecionada: altIndex,
        tempoSegundos: tempoSegundos || 0
      });

      return res.json({
        status: "success",
        ...resultado
      });
    } catch (err) {
      console.error("[QUESTOES ROUTE][ERROR] Erro ao registrar resposta:", err.message);
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// 3. PROGRESSO E ESTATÍSTICAS REAIS DO ESTUDANTE
questoesRouter.get(
  ["/api/questoes/progresso", "/questoes/progresso", "/api/study/progress", "/study/progress"],
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.userId;
      const userEmail = req.user?.email;

      if (!userId && !userEmail) {
        return res.json({
          status: "success",
          totalRespondidas: 0,
          acertos: 0,
          erros: 0,
          aproveitamento: 0,
          porEspecialidade: {},
          ultimasRespostas: []
        });
      }

      const progresso = await QuestoesGeneratorService.getUserStudyProgress(userId, userEmail);
      return res.json({
        status: "success",
        ...progresso
      });
    } catch (err) {
      console.error("[QUESTOES ROUTE][ERROR] Erro ao carregar progresso:", err.message);
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// 4. GERADOR DINÂMICO DE QUESTÕES INÉDITAS COM IA
questoesRouter.post(["/api/questoes/gerar", "/questoes/gerar"], async (req, res) => {
  try {
    const { especialidade, tema, dificuldadeEspecifica } = req.body;
    const resultado = await QuestoesGeneratorService.generateQuestionsBatch({
      especialidade,
      tema,
      dificuldadeEspecifica
    });
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 5. LISTAGEM DE FLASHCARDS
questoesRouter.get(["/api/flashcards", "/flashcards"], async (req, res) => {
  try {
    const { deckId } = req.query;
    const cards = await QuestoesGeneratorService.listFlashcards({ deckId });
    return res.json({ status: "success", count: cards.length, flashcards: cards });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
