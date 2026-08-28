import { Router } from "express";
import { EspecializacaoRoadmapService } from "../services/especializacao-roadmap.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const especialidadesRouter = Router();

/**
 * 1. LISTAR TODAS AS ESPECIALIDADES DE RESIDÊNCIA
 */
especialidadesRouter.get(["/api/especialidades", "/especialidades"], (req, res) => {
  const lista = EspecializacaoRoadmapService.listEspecialidades();
  return res.json({
    sucesso: true,
    total: lista.length,
    dados: lista
  });
});

/**
 * 2. BUSCAR ROADMAP COMPLETO DE UMA ESPECIALIDADE
 */
especialidadesRouter.get(["/api/especialidades/:id/roadmap", "/especialidades/:id/roadmap"], (req, res) => {
  const { id } = req.params;
  const roadmap = EspecializacaoRoadmapService.getRoadmap(id);

  if (!roadmap) {
    return res.status(404).json({
      sucesso: false,
      mensagem: `Especialidade '${id}' não encontrada.`
    });
  }

  return res.json({
    sucesso: true,
    dados: roadmap
  });
});

/**
 * 3. BUSCAR FASE ESPECÍFICA COM MÓDULOS E CHECKPOINTS
 */
especialidadesRouter.get(["/api/especialidades/:id/fases/:faseId", "/especialidades/:id/fases/:faseId"], (req, res) => {
  const { id, faseId } = req.params;
  const fase = EspecializacaoRoadmapService.getFase(id, faseId);

  if (!fase) {
    return res.status(404).json({
      sucesso: false,
      mensagem: `Fase ${faseId} da especialidade '${id}' não encontrada.`
    });
  }

  return res.json({
    sucesso: true,
    dados: fase
  });
});

/**
 * 4. BUSCAR DETALHES DE UMA ESPECIALIDADE
 */
especialidadesRouter.get(["/api/especialidades/:id", "/especialidades/:id"], (req, res) => {
  const { id } = req.params;
  const esp = EspecializacaoRoadmapService.getEspecialidadeById(id);

  if (!esp) {
    return res.status(404).json({
      sucesso: false,
      mensagem: `Especialidade '${id}' não encontrada.`
    });
  }

  return res.json({
    sucesso: true,
    dados: esp
  });
});

/**
 * 5. INICIAR ESPECIALIZAÇÃO
 */
especialidadesRouter.post(
  ["/api/usuarios/:usuarioId/especialidades/:especId/iniciar", "/usuarios/:usuarioId/especialidades/:especId/iniciar"],
  authenticate,
  async (req, res) => {
    const { usuarioId, especId } = req.params;
    try {
      const registro = await EspecializacaoRoadmapService.iniciarEspecializacao({
        usuarioId: usuarioId || req.user?.id || "student-demo",
        especialidadeId: especId
      });
      return res.status(201).json({
        sucesso: true,
        mensagem: "Especialização e plano de residência iniciados com sucesso!",
        dados: registro
      });
    } catch (err) {
      return res.status(400).json({ sucesso: false, mensagem: err.message });
    }
  }
);

/**
 * 6. OBTER PROGRESSO DA ESPECIALIZAÇÃO
 */
especialidadesRouter.get(
  ["/api/usuarios/:usuarioId/especialidades/:especId/progresso", "/usuarios/:usuarioId/especialidades/:especId/progresso"],
  authenticate,
  async (req, res) => {
    const { usuarioId, especId } = req.params;
    const progresso = await EspecializacaoRoadmapService.getProgresso({
      usuarioId: usuarioId || req.user?.id || "student-demo",
      especialidadeId: especId
    });
    return res.json({
      sucesso: true,
      dados: progresso
    });
  }
);
