import { query } from "../src/config/database.js";

async function inspectDocs() {
  console.log("=== DOCUMENTOS NA BASE DE DADOS POSTGRESQL ===");
  const docsRes = await query(`
    SELECT d.id, d.title, d.category, d.filename, COUNT(dc.id) as chunk_count 
    FROM documents d 
    LEFT JOIN document_chunks dc ON dc.document_id = d.id 
    GROUP BY d.id, d.title, d.category, d.filename
    ORDER BY d.id;
  `);

  console.log(`Total de Documentos: ${docsRes.rows.length}`);
  docsRes.rows.forEach(r => {
    console.log(`- ID: ${r.id} | Categoria: "${r.category}" | Chunks: ${r.chunk_count} | Título: "${r.title}"`);
  });

  process.exit(0);
}

inspectDocs().catch(err => {
  console.error(err);
  process.exit(1);
});
