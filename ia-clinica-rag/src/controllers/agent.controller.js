import { SPECIALTY_AGENTS } from "../config/agents.config.js";

export async function handleListAgents(req, res) {
  try {
    return res.status(200).json({
      status: "success",
      agents: SPECIALTY_AGENTS
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao listar agentes médicos.",
      detail: error.message
    });
  }
}
