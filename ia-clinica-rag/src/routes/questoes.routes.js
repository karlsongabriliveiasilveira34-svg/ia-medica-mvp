import { Router } from "express";
import { QuestoesGeneratorService } from "../services/questoes-generator.service.js";

export const questoesRouter = Router();

// Listagem de Questões (com filtros)
questoesRouter.get(["/api/questoes", "/questoes"], async (req, res) => {
  try {
    const { especialidade, tema, banca, dificuldade } = req.query;
    const questoes = await QuestoesGeneratorService.listQuestions({ especialidade, tema, banca, dificuldade });
    return res.json({ status: "success", count: questoes.length, questoes });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// Gerador Dinâmico de Questões Inéditas com Gemini
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

// Listagem de Flashcards
questoesRouter.get(["/api/flashcards", "/flashcards"], async (req, res) => {
  try {
    const { deckId } = req.query;
    const cards = await QuestoesGeneratorService.listFlashcards({ deckId });
    return res.json({ status: "success", count: cards.length, flashcards: cards });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
