import { query } from "../src/config/database.js";

async function cleanupLegacyGarbage() {
  console.log("🧹 Limpando entradas legadas não-médicas (READMEs, makefiles, logs de código)...");

  // Deletar documentos cujo título seja README, Makefile, requirements ou lebedev
  const deletedDocs = await query(`
    DELETE FROM documents 
    WHERE title ILIKE 'README%' 
       OR title ILIKE 'Makefile%' 
       OR title ILIKE 'requirements%' 
       OR title ILIKE 'lebedev%'
       OR title ILIKE 'ISSUE TEMPLATE%'
       OR title ILIKE 'gnina%'
       OR title ILIKE 'degrees%'
       OR title ILIKE 'preprocessed%'
       OR title ILIKE 'selfsupervised%'
       OR title ILIKE 'vocab%'
       OR title ILIKE 'intro%'
       OR title ILIKE 'sql%'
    RETURNING id, title
  `);

  console.log(`Documentos excluídos: ${deletedDocs.rows.length}`);

  // Deletar fontes correspondentes
  const deletedSources = await query(`
    DELETE FROM sources 
    WHERE title ILIKE 'README%' 
       OR title ILIKE 'Makefile%' 
       OR title ILIKE 'requirements%' 
       OR title ILIKE 'lebedev%'
       OR title ILIKE 'ISSUE TEMPLATE%'
       OR title ILIKE 'gnina%'
       OR title ILIKE 'degrees%'
       OR title ILIKE 'preprocessed%'
       OR title ILIKE 'selfsupervised%'
       OR title ILIKE 'vocab%'
       OR title ILIKE 'intro%'
       OR title ILIKE 'sql%'
       OR (organization IS NULL AND validation_status != 'approved')
    RETURNING id, title
  `);

  console.log(`Fontes excluídas: ${deletedSources.rows.length}`);
  console.log("✅ Limpeza concluída!");
}

cleanupLegacyGarbage().catch(console.error).finally(() => process.exit(0));
