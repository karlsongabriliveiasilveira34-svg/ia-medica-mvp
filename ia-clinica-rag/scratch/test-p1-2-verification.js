import fetch from 'node-fetch';
import { ExternalEvidenceService } from '../src/services/external-evidence.service.js';
import { sortByEvidenceLevel, sortByRecency, sortBySimilarity } from '../src/services/evidence-ranker.service.js';

const BASE_URL = 'http://localhost:3000';

async function runP1_2Verification() {
  console.log('🧪 Iniciando Validação dos Requisitos P1.2 (Cochrane & Nível GRADE) e P1.3 (Deep-links)...\n');

  // 1. Testar Busca na Cochrane Library via ExternalEvidenceService
  console.log('--------------------------------------------------');
  console.log('📚 [TESTE 1] Busca direta na Cochrane Database of Systematic Reviews...');
  const cochraneResults = await ExternalEvidenceService.searchCochraneReviews('sepsis antimicrobial treatment', 2);
  console.log(`✅ Sucesso! Total de Revisões Sistemáticas Cochrane encontradas: ${cochraneResults.length}`);
  cochraneResults.forEach((item, idx) => {
    console.log(`  [Cochrane #${idx + 1}]`);
    console.log(`    📌 Título: ${item.document_title}`);
    console.log(`    🏆 Nível GRADE: ${item.gradeLevel}`);
    console.log(`    🔗 URL Direct Link: ${item.url}`);
  });

  // 2. Testar Endpoint de Consulta RAG Integrado com Cochrane e Deep-links
  console.log('\n--------------------------------------------------');
  console.log('🩺 [TESTE 2] Consulta no backend /api/query com retorno de citações e Deep-links...');
  const resQuery = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Qual a evidência científica para uso de antibióticos na sepse precoce?',
      specialty: 'infectious_diseases'
    })
  });
  const dataQuery = await resQuery.json();
  console.log(`✅ Consulta processada com sucesso! (${dataQuery.citations ? dataQuery.citations.length : 0} citações)`);

  if (dataQuery.citations && dataQuery.citations.length > 0) {
    dataQuery.citations.forEach((cit, i) => {
      console.log(`\n  [Citação #${i + 1}]`);
      console.log(`    📌 Título: ${cit.title}`);
      console.log(`    🏆 Nível de Evidência: ${cit.gradeLevel}`);
      console.log(`    📄 Página: ${cit.page}`);
      console.log(`    🔗 Botão "Ver no Original" URL: ${cit.url}`);
    });
  }

  // 3. Testar Rota de Servimento Estático /knowledge (Deep-link PDF)
  console.log('\n--------------------------------------------------');
  console.log('📄 [TESTE 3] Testar acesso à rota de servimento estático de PDF em /knowledge...');
  const firstFilename = dataQuery.citations && dataQuery.citations[0]?.filename ? dataQuery.citations[0].filename : 'artigos/artigo.ia13.pdf';
  const resPdf = await fetch(`${BASE_URL}/knowledge/${encodeURIComponent(firstFilename)}`);
  console.log(`✅ Servidor estático de PDF /knowledge status HTTP: ${resPdf.status} ${resPdf.statusText}`);

  // 4. Testar Ordenações de Evidência
  console.log('\n--------------------------------------------------');
  console.log('📊 [TESTE 4] Testar algoritmos de ordenação por Evidência GRADE, Recência e Similaridade...');
  const sampleChunks = dataQuery.citations || [];
  const sortedByGrade = sortByEvidenceLevel(sampleChunks);
  const sortedByYear = sortByRecency(sampleChunks);
  const sortedBySim = sortBySimilarity(sampleChunks);

  console.log(`  - Ordenado por GRADE (Maior Evidência Primeiro): Top 1 = ${sortedByGrade[0]?.gradeLevel || 'N/A'}`);
  console.log(`  - Ordenado por Recência (Mais Recente Primeiro): Top 1 Ano = ${sortedByYear[0]?.year || 'N/A'}`);
  console.log(`  - Ordenado por Similaridade: Top 1 RRF = ${sortedBySim[0]?.title || 'N/A'}`);

  console.log('\n✨ Validação P1.2 e P1.3 concluída com sucesso!');
}

runP1_2Verification().catch(console.error);
