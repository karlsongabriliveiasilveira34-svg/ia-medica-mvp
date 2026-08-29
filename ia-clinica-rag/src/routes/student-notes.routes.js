import { Router } from "express";
import { StudentNotesService } from "../services/student-notes.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const studentNotesRouter = Router();

// 1. LISTAR ANOTACOES DO ESTUDANTE
studentNotesRouter.get(
  ["/api/student/notes", "/student/notes"],
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.userId || "anonimo";
      const rawSearch = typeof req.query?.search === "string"
        ? req.query.search
        : (typeof req.query?.q === "string" ? req.query.q : "");
      const search = rawSearch.trim().slice(0, 200);

      const notes = await StudentNotesService.listNotes({ userId, userEmail, search });
      return res.json({
        status: "success",
        count: notes.length,
        notes,
        data: notes
      });
    } catch (err) {
      console.error("[STUDENT NOTES ROUTE] Erro ao listar anotacoes:", err.message);
      return res.status(500).json({ status: "error", message: "Erro ao buscar anotacoes." });
    }
  }
);

// 2. CRIAR NOVA ANOTACAO
studentNotesRouter.post(
  ["/api/student/notes", "/student/notes"],
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.userId || "anonimo";
      const userEmail = req.user?.email || null;
      const { title, content, drawingData, tags, triggerAi = true } = req.body;

      const newNote = await StudentNotesService.createNote({
        userId,
        userEmail,
        title,
        content,
        drawingData,
        tags,
        triggerAi
      });

      return res.status(201).json({
        status: "success",
        note: newNote,
        data: newNote
      });
    } catch (err) {
      console.error("[STUDENT NOTES ROUTE] Erro ao criar anotacao:", err.message);
      return res.status(500).json({ status: "error", message: "Erro ao salvar anotacao." });
    }
  }
);

// 3. OBTER ANOTACAO POR ID
studentNotesRouter.get(
  ["/api/student/notes/:id", "/student/notes/:id"],
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.userId || null;
      const note = await StudentNotesService.getNoteById(id, userId);

      if (!note) {
        return res.status(404).json({ status: "error", message: "Anotacao nao encontrada." });
      }

      return res.json({
        status: "success",
        note,
        data: note
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// 4. ATUALIZAR ANOTACAO
studentNotesRouter.put(
  ["/api/student/notes/:id", "/student/notes/:id"],
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.userId || null;
      const { title, content, drawingData, tags, triggerAi = false } = req.body;

      const updated = await StudentNotesService.updateNote({
        id,
        userId,
        title,
        content,
        drawingData,
        tags,
        triggerAi
      });

      if (!updated) {
        return res.status(404).json({ status: "error", message: "Anotacao nao encontrada para atualizar." });
      }

      return res.json({
        status: "success",
        note: updated,
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// 5. EXCLUIR ANOTACAO
studentNotesRouter.delete(
  ["/api/student/notes/:id", "/student/notes/:id"],
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.userId || null;

      await StudentNotesService.deleteNote({ id, userId });

      return res.json({
        status: "success",
        message: "Anotacao excluida com sucesso."
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
  }
);

// 6. GERAR SUGESTOES DA IA PRECEPTORA SOB DEMANDA
studentNotesRouter.post(
  ["/api/student/notes/ai-suggest", "/student/notes/ai-suggest"],
  authenticate,
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const suggestions = await StudentNotesService.generateAiSuggestions({ title, content });

      return res.json({
        status: "success",
        count: suggestions.length,
        suggestions
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: "Erro ao gerar sugestoes com a IA Preceptora." });
    }
  }
);
