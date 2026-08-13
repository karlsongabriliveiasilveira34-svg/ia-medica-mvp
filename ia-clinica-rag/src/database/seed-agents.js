import { query, pool } from "../config/database.js";
import { SPECIALTY_AGENTS } from "../config/agents.config.js";

export async function seedAgents() {
  console.log("🌱 Semeando agentes clínicos no banco de dados...");
  for (const agent of SPECIALTY_AGENTS) {
    await query(
      `
        INSERT INTO clinical_agents (id, name, description, system_prompt, retrieval_filters, clinical_domains, enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          system_prompt = EXCLUDED.system_prompt,
          retrieval_filters = EXCLUDED.retrieval_filters,
          clinical_domains = EXCLUDED.clinical_domains,
          enabled = EXCLUDED.enabled
      `,
      [
        agent.id,
        agent.name,
        agent.description,
        agent.systemPrompt,
        JSON.stringify(agent.retrievalFilters || {}),
        JSON.stringify(agent.clinicalDomains || []),
        agent.enabled
      ]
    );
  }
  console.log("✅ Semeatura dos 8 Agentes Clínicos concluída com sucesso!");
}

if (process.argv[1].endsWith("seed-agents.js")) {
  seedAgents().then(() => pool.end());
}
