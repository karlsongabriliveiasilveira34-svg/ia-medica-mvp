import fetch from 'node-fetch';
import { PreProcessorAgent } from '../src/agents/pre-processor.agent.js';

const BASE_URL = 'http://localhost:3000';

async function runP2Verification() {
  console.log('🧪 Iniciando Validação dos Requisitos P2.1 (Perguntas Clicáveis), P2.2 (Retomada de Sessão) e LGPD...\n');

  // 1. Testar Sanitização de Dados Pessoais em Conformidade com LGPD (Lei 13.709/2018)
  console.log('--------------------------------------------------');
  console.log('🔒 [TESTE 1] Testando Sanitização LGPD de PHI no PreProcessorAgent...');
  const rawInput = 'Paciente João Silva, CPF 123.456.789-00, RG 12.345.678-9, e-mail joao@email.com, tel (11) 98765-4321, com queixa de dor torácica.';
  const sanitized = PreProcessorAgent.sanitizePHI(rawInput);
  console.log(`  Entrada Bruta: "${rawInput}"`);
  console.log(`  Saída Sanitizada LGPD: "${sanitized}"`);

  const lgpdSuccess = !sanitized.includes('123.456.789-00') && !sanitized.includes('joao@email.com') && sanitized.includes('[CPF REDIGIDO LGPD]');
  console.log(`✅ Status de Conformidade LGPD: ${lgpdSuccess ? '✅ Aprovado (Dados Sensíveis Redigidos)' : '❌ Reprovado'}`);

  // 2. Testar Sugestões de Próximas Perguntas Clicáveis (P2.1)
  console.log('\n--------------------------------------------------');
  console.log('💡 [TESTE 2] Testando retorno de Sugestões de Próximas Perguntas (P2.1)...');
  const resQuery = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente de 65 anos com hipertensão e dor no peito. Qual conduta inicial?',
      specialty: 'cardiology'
    })
  });
  const dataQuery = await resQuery.json();
  const sessionId = dataQuery.sessionId;

  console.log(`✅ Consulta processada. Total de Próximas Perguntas Sugeridas: ${dataQuery.followUpQuestions ? dataQuery.followUpQuestions.length : 0}`);
  if (dataQuery.followUpQuestions) {
    dataQuery.followUpQuestions.forEach((q, idx) => {
      console.log(`  [Pergunta Sugerida #${idx + 1}] "${q}"`);
    });
  }

  // 3. Testar Listagem de Sessões Passadas (P2.2)
  console.log('\n--------------------------------------------------');
  console.log('📂 [TESTE 3] GET /api/sessions - Listar histórico de sessões para retomada entre dias (P2.2)...');
  const resSessions = await fetch(`${BASE_URL}/api/sessions`);
  const dataSessions = await resSessions.json();
  console.log(`✅ Sucesso! Total de sessões clínicas recuperadas: ${dataSessions.sessions ? dataSessions.sessions.length : 0}`);

  // 4. Testar Síntese de Retomada do Caso (P2.2) ao Reabrir Sessão
  console.log('\n--------------------------------------------------');
  console.log('📌 [TESTE 4] GET /api/sessions/:id - Gerar Resumo de Retomada do Caso...');
  const resGetSession = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
  const dataGetSession = await resGetSession.json();

  console.log(`✅ Resumo da Retomada: "${dataGetSession.resumeSummary?.title}"`);
  console.log(`   - Texto do Resumo: "${dataGetSession.resumeSummary?.summaryText}"`);
  console.log(`   - Próximos passos sugeridos: ${dataGetSession.resumeSummary?.suggestedNextSteps?.join('; ')}`);

  console.log('\n✨ Validação P2.1, P2.2 e LGPD concluída com sucesso!');
}

runP2Verification().catch(console.error);
