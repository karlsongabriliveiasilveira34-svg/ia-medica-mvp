import { CoordinatorAgent } from "./src/agents/coordinator.agent.js";

async function test() {
  console.log("🚀 Testando fluxo completo do CoordinatorAgent...");
  const question = "Quais são os principais achados sobre inteligência artificial aplicados à cardiologia?";
  
  const result = await CoordinatorAgent.processQuery({
    question,
    topK: 3
  });

  console.log("\n================ RESULTADO DA CONSULTA ================");
  console.log("Status:", result.status);
  console.log("Latência (ms):", result.latencyMs);
  console.log("Score de Confiança:", result.confidenceScore);
  console.log("Groundedness Verificado:", result.isVerified);
  console.log("Citações Encontradas:", result.citations.length);
  console.log("\nResposta Gerada:\n", result.answer);

  if (result.citations.length > 0) {
    console.log("\nPrimeira Citação:", {
      title: result.citations[0].title,
      filename: result.citations[0].filename,
      rrfScore: result.citations[0].rrfScore,
      excerpt: result.citations[0].excerpt.substring(0, 150) + "..."
    });
  }

  process.exit(0);
}

test().catch(err => {
  console.error("❌ Erro no teste:", err);
  process.exit(1);
});
