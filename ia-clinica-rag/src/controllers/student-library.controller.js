import { studentLibraryService } from "../services/student-library.service.js";

/**
 * Controller da Biblioteca Estudantil & Quiz Generator
 */
export async function getStudentLibraryHandler(req, res) {
  try {
    const { category, specialty } = req.query;
    const items = studentLibraryService.getCatalog(category, specialty);

    return res.json({
      status: "success",
      count: items.length,
      data: items
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

export async function attachDocumentToChatHandler(req, res) {
  try {
    const { documentId } = req.body || {};

    if (!documentId) {
      return res.status(400).json({
        status: "error",
        message: "ID do documento é obrigatório."
      });
    }

    const docContext = studentLibraryService.getDocumentForChat(documentId);

    return res.json({
      status: "success",
      message: `Documento "${docContext.title}" anexado com sucesso para a IA.`,
      data: docContext
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
}

export async function generateQuizHandler(req, res) {
  try {
    const { topic = "Clínica Médica", conversationSummary = "" } = req.body || {};

    const quiz = await studentLibraryService.generateClinicalQuiz({
      topic,
      conversationSummary
    });

    return res.json({
      status: "success",
      data: quiz
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}
