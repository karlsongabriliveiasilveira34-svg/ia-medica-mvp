import { query } from "../src/config/database.js";
import { createEmbedding } from "../src/services/embedding.service.js";
import { vectorToPg } from "../src/utils/vector.js";

async function reseedAllEmbeddings() {
  console.log("🔄 Iniciando re-vetorização completa de todos os chunks no PostgreSQL...");

  const res = await query(
    `SELECT dc.id, dc.content, d.title 
     FROM document_chunks dc 
     JOIN documents d ON d.id = dc.document_id`
  );

  console.log(`📋 Total de chunks encontrados para re-vetorização: ${res.rows.length}`);

  let successCount = 0;
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows[i];
    console.log(`\n Processing [${i + 1}/${res.rows.length}]: "${row.title}" (ID: ${row.id})`);
    
    try {
      const embedding = await createEmbedding(row.content);
      const pgVectorStr = vectorToPg(embedding);

      await query(
        `UPDATE document_chunks SET embedding = $1 WHERE id = $2`,
        [pgVectorStr, row.id]
      );

      const norm = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0)).toFixed(4);
      console.log(`   ✅ Sucesso! Vetor atualizado. Dimensões: ${embedding.length}, Norma: ${norm}, Primeiros valores: [${embedding.slice(0, 3).map(n => n.toFixed(5)).join(", ")}]`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Erro ao gerar embedding para "${row.title}":`, err.message);
    }
  }

  console.log(`\n🎉 Re-vetorização concluída! ${successCount}/${res.rows.length} chunks vetorizados com sucesso.`);
  process.exit(0);
}

reseedAllEmbeddings().catch(err => {
  console.error("❌ Erro fatal na re-vetorização:", err);
  process.exit(1);
});
