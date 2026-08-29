import { Router } from "express";
import { UnimontesRoadmapService } from "../services/unimontes-roadmap.service.js";

export const unimontesRouter = Router();

// 1. Listar todos os 12 períodos da UNIMONTES
unimontesRouter.get("/periodos", (req, res) => {
  try {
    const periodos = UnimontesRoadmapService.listPeriodos();
    return res.json({
      status: "success",
      faculdade: "UNIMONTES - Universidade Estadual de Montes Claros",
      curso: "Medicina (CCBS)",
      filosofia: "IAPSC - Interação-Aprendizagem-Pesquisa-Serviço-Comunidade",
      totalPeriodos: periodos.length,
      cargaHorariaTotal: 8000,
      periodos
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 2. Obter detalhes completos de um período
unimontesRouter.get("/periodos/:periodoId", (req, res) => {
  try {
    const periodo = UnimontesRoadmapService.getPeriodo(req.params.periodoId);
    if (!periodo) {
      return res.status(404).json({
        status: "error",
        message: "Período curricular da UNIMONTES não encontrado."
      });
    }

    return res.json({
      status: "success",
      dados: periodo
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 3. Obter quiz / questões do período
unimontesRouter.get("/periodos/:periodoId/quiz", (req, res) => {
  try {
    const quiz = UnimontesRoadmapService.getPeriodoQuiz(req.params.periodoId);
    return res.json({
      status: "success",
      periodoId: req.params.periodoId,
      totalQuestoes: quiz.length,
      questoes: quiz
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// Store em memória de progresso dos estudantes na UNIMONTES
const studentProgressStore = new Map();

// 4. Registrar progresso do aluno em um período
unimontesRouter.post("/progresso", (req, res) => {
  try {
    const { periodoId, videoId, casoId, checkpointIdx, concluido } = req.body;
    const userId = req.user?.id || req.body.userId || "anonymous_student";

    if (!studentProgressStore.has(userId)) {
      studentProgressStore.set(userId, {
        periodoAtual: 1,
        videosAssistidos: [],
        casosResolvidos: [],
        checkpointsConcluidos: [],
        horasInvestidas: 65
      });
    }

    const prog = studentProgressStore.get(userId);
    if (periodoId) prog.periodoAtual = Number.parseInt(periodoId, 10);
    if (videoId && !prog.videosAssistidos.includes(videoId)) prog.videosAssistidos.push(videoId);
    if (casoId && !prog.casosResolvidos.includes(casoId)) prog.casosResolvidos.push(casoId);
    if (checkpointIdx !== undefined && !prog.checkpointsConcluidos.includes(checkpointIdx)) {
      prog.checkpointsConcluidos.push(checkpointIdx);
    }

    return res.json({
      status: "success",
      message: "Progresso curricular atualizado com sucesso!",
      progresso: prog
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

// 5. Consultar progresso curricular do aluno
unimontesRouter.get("/progresso", (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "anonymous_student";
    const prog = studentProgressStore.get(userId) || {
      periodoAtual: 1,
      videosAssistidos: ["1.1", "1.2"],
      casosResolvidos: ["1.1"],
      checkpointsConcluidos: [0],
      horasInvestidas: 65,
      mediaQuizzes: 78
    };

    return res.json({
      status: "success",
      progresso: prog
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});
