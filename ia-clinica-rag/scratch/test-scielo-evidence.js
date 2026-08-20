import { ExternalEvidenceService } from "../src/services/external-evidence.service.js";

async function testSciELOAndPubMed() {
  console.log("🇧🇷 Testando SciELO Search API e PubMed API diretamente...\n");

  const query = "insuficiencia cardiaca e fracao de ejecao";
  console.log(`🔎 Buscando SciELO para: "${query}"...`);
  const scieloResults = await ExternalEvidenceService.searchSciELO(query, 3);

  console.log(`\n✅ Resultados SciELO: ${scieloResults.length}`);
  scieloResults.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] ${r.document_title}`);
    console.log(`    Periódico: ${r.organization}`);
    console.log(`    DOI: ${r.doi}`);
    console.log(`    URL: ${r.url}`);
    console.log(`    Trecho: ${r.content.substring(0, 180)}...`);
  });

  console.log(`\n----------------------------------------------------`);
  console.log(`🌐 Buscando PubMed para: "${query}"...`);
  const pubmedResults = await ExternalEvidenceService.searchPubMed(query, 2);
  console.log(`✅ Resultados PubMed: ${pubmedResults.length}`);
  pubmedResults.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] ${r.document_title}`);
    console.log(`    PMID: ${r.pmid}`);
    console.log(`    URL: ${r.url}`);
  });
}

testSciELOAndPubMed().catch(console.error);
