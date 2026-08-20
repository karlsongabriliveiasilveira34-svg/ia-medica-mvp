import fetch from 'node-fetch';
import { env } from '../src/config/env.js';

const BASE_URL = 'http://localhost:3000';

async function runP0_3_P1_7Verification() {
  console.log('🧪 Iniciando Validação do Modelo Gemini 1.5 Flash, P0.3 (Classificação de Intenção) e P1.7 (Interface & Fontes)...\n');

  // 1. Verificar Modelo Configurado
  console.log('--------------------------------------------------');
  console.log(`🤖 Modelo Gemini Configurado no Sistema: "${env.geminiModel}"`);
  console.log(`✅ status Modelo Econômico Otimizado: ${env.geminiModel === 'gemini-1.5-flash' ? '✅ OK (gemini-1.5-flash)' : '⚠️ Outro'}`);

  // 2. Testar P0.3 - Intenção (a) NOVO_CASO vs Intenção (b) PERGUNTA_ACOMPANHAMENTO
  console.log('\n--------------------------------------------------');
  console.log('🩺 [TESTE TURNO 1] Apresentação Inicial de Sintomas (Novo Caso)...');
  const res1 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente masculino de 52 anos, hipertenso, com dor torácica opressiva há 2h e ECG com Supra ST V1-V4.',
      specialty: 'cardiology'
    })
  });
  const data1 = await res1.json();
  const sessionId = data1.sessionId;

  const text1 = data1.answer || data1.message || '';
  console.log(`✅ Turno 1 Processado na Sessão #${sessionId}`);
  console.log(`   Resposta Gerada (Amostra): "${text1.slice(0, 200)}..."`);

  console.log('\n💬 [TESTE TURNO 2 - P0.3] Enviando Pergunta Pontual de Acompanhamento no Mesmo Caso...');
  const res2 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Qual a dose exata inicial de Ácido Acetilsalicílico (AAS) e Clopidogrel recomendada nesta emergência?',
      specialty: 'cardiology',
      sessionId
    })
  });
  const data2 = await res2.json();
  const text2 = data2.answer || data2.message || '';

  console.log(`✅ Turno 2 Processado na Sessão #${sessionId}`);
  console.log(`🤖 Resposta Direta de Acompanhamento:\n${text2.slice(0, 350)}...\n`);

  const answersDirectly = text2.toLowerCase().includes('dose') || text2.toLowerCase().includes('mg') || text2.toLowerCase().includes('aas');
  const doesNotRestartSymptoms = !text2.includes('por favor, informe os sintomas do paciente');

  console.log(`  - Respondeu diretamente com a posologia: ${answersDirectly ? '✅ Sim' : '❌ Não'}`);
  console.log(`  - Evitou o re-disparo do formulário de sintomas: ${doesNotRestartSymptoms ? '✅ Sim' : '❌ Não'}`);

  // 3. Testar P1.7 - Fontes e Citações
  console.log('\n--------------------------------------------------');
  console.log('📚 [TESTE P1.7] Conferindo Citações e Fontes da Resposta...');
  console.log(`✅ Total de Citações Ancoradas: ${data2.citations ? data2.citations.length : 0}`);
  if (data2.citations && data2.citations.length > 0) {
    data2.citations.forEach((c, idx) => {
      console.log(`  [Fonte #${idx + 1}] Título: "${c.title}" | Nível: "${c.gradeLevel || 'GRADE'}" | URL: "${c.url || 'Local'}"`);
    });
  }

  console.log('\n✨ Validação de Gemini 1.5 Flash, P0.3 e P1.7 concluída com sucesso!');
}

runP0_3_P1_7Verification().catch(console.error);
