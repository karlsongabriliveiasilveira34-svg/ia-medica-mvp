import { query } from "../src/config/database.js";

async function cleanUnauthorizedSources() {
  console.log("🧹 Limpando todas as fontes sem organização oficial ou com nomes de código...");

  // Excluir fontes onde organization IS NULL ou organization é vazio
  const res = await query(`
    DELETE FROM sources 
    WHERE organization IS NULL 
       OR organization = ''
       OR title ILIKE 'tab 222%'
       OR title ILIKE 'mast.%'
       OR title ILIKE 'pdoc%'
       OR title ILIKE 'ps00%'
       OR title ILIKE 'rfam%'
       OR title ILIKE 'pfam%'
       OR title ILIKE 'cmsearch%'
       OR title ILIKE 'cmscan%'
       OR title ILIKE 'soft ex%'
       OR title ILIKE 'GSE%'
       OR title ILIKE 'GSM%'
       OR title ILIKE 'water%'
       OR title ILIKE 'needle%'
       OR title ILIKE 'matcher%'
       OR title ILIKE 'dict%'
       OR title ILIKE 'CDR %'
       OR title ILIKE 'TestSet%'
       OR title ILIKE 'biogpt%'
       OR title ILIKE 'sample%'
       OR title ILIKE 'lebedev%'
       OR title ILIKE 'LICENSE%'
       OR title ILIKE 'SECURITY%'
       OR title ILIKE 'SUPPORT%'
       OR title ILIKE 'DISCLAIMER%'
       OR title ILIKE 'CODE OF CONDUCT%'
       OR title ILIKE 'CONTRIBUTING%'
       OR title ILIKE 'PULL REQUEST%'
       OR title ILIKE 'ISSUE TEMPLATE%'
       OR title ILIKE 'README%'
       OR title ILIKE 'Makefile%'
    RETURNING id, title
  `);

  console.log(`✅ Total de fontes não-médicas removidas: ${res.rows.length}`);

  const remaining = await query(`SELECT id, title, organization, authority_level FROM sources ORDER BY authority_level ASC`);
  console.log(`\n📚 Fontes Oficiais Ativas Remanescentes no Catálogo (${remaining.rows.length}):`);
  remaining.rows.forEach((r, idx) => {
    console.log(`  [${idx + 1}] Nível ${r.authority_level}: "${r.title}" (${r.organization})`);
  });
}

cleanUnauthorizedSources().catch(console.error).finally(() => process.exit(0));
