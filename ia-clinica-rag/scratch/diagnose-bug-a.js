import { createEmbedding } from "../src/services/embedding.service.js";
import { RetrievalAgent } from "../src/agents/retrieval.agent.js";
import { query } from "../src/config/database.js";
import { rankAndDeduplicateEvidence } from "../src/services/evidence-ranker.service.js";

async function runDiagnosis() {
  console.log("=== DIAGNÓSTICO DO BUG A ===");
  const testQuery = "sintomas de gripe";

  // 1. Testar Embedding
  console.log("\n1. Testando geração de embedding...");
  const emb = await createEmbedding(testQuery);
  console.log(`Embedding gerado. Comprimento: ${emb.length}. Primeiros 5 valores:`, emb.slice(0, 5));

  // 2. Testar Vector Search puro
  console.log("\n2. Executando busca vetorial direta (Postgres)...");
  const vectorDocs = await RetrievalAgent.searchVector(emb, { limit: 10 });
  console.log(`Retornados ${vectorDocs.length} documentos da busca vetorial:`);
  vectorDocs.forEach((d, i) => {
    console.log(` [${i+1}] Similaridade: ${(d.similarity).toFixed(4)} | Título: "${d.document_title}" | Trecho: "${d.content.slice(0, 80)}..."`);
  });

  // 3. Testar Full Text Search puro
  console.log("\n3. Executando busca FTS direta (Postgres)...");
  const textDocs = await RetrievalAgent.searchText(testQuery, { limit: 10 });
  console.log(`Retornados ${textDocs.length} documentos da busca por texto:`);
  textDocs.forEach((d, i) => {
    console.log(` [${i+1}] Rank: ${(d.rank).toFixed(4)} | Título: "${d.document_title}" | Trecho: "${d.content.slice(0, 80)}..."`);
  });

  // 4. Testar RRF + Ranker
  console.log("\n4. Testando RRF + Evidence Ranker...");
  const fused = RetrievalAgent.applyRRF(vectorDocs, textDocs);
  console.log(`Fused docs count: ${fused.length}`);
  fused.forEach((d, i) => {
    console.log(` [${i+1}] RRF Score: ${d.rrfScore} | Sim: ${d.vectorSimilarity} | Title: "${d.document_title}"`);
  });

  const ranked = rankAndDeduplicateEvidence(fused, 5);
  console.log("\n5. Documentos Finais Ranqueados pelo EvidenceRanker:");
  ranked.forEach((d, i) => {
    console.log(` [${i+1}] Final EvidenceScore: ${d.evidenceScore} | RRF: ${d.rrfScore} | Title: "${d.document_title}"`);
  });

  await query("SELECT 1");
  process.exit(0);
}

runDiagnosis().catch(err => {
  console.error("Erro no diagnóstico:", err);
  process.exit(1);
});
