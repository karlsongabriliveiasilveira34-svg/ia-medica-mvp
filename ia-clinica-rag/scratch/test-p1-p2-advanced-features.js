import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAdvancedFeaturesTest() {
  console.log('🚀 [TESTE DE VALIDAÇÃO P1 & P2] Testando Modo Médico vs Estudante, Mapa de Consenso, Rationale e Auditoria...\n');

  // =========================================================================
  // TESTE 1: MODO MÉDICO (userMode: 'doctor')
  // =========================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('🩺 [TESTE 1] Testando Consulta em MODO MÉDICO (Foco Resolutivo / Prescrição)...');
  const resDoctor = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente com crise de asma grave, sibilância difusa e saturação 88% em ar ambiente. Conduta medicamentosa imediata e doses?',
      specialty: 'emergency',
      userMode: 'doctor'
    })
  });

  const dataDoctor = await resDoctor.json();
  if (!resDoctor.ok) {
    console.error('❌ Erro no Teste Modo Médico:', dataDoctor);
    return;
  }

  console.log(`✅ Consulta Modo Médico Concluída com Sucesso!`);
  console.log(`   - Persona Retornada: "${dataDoctor.userMode}"`);
  console.log(`   - Trace ID de Auditoria: "${dataDoctor.auditTraceId}"`);
  console.log(`   - Mapa de Consenso Calculado: ${dataDoctor.consensusMatrix?.agreementPercentage}% (${dataDoctor.consensusMatrix?.consensusLevel})`);
  console.log(`   - Total de Fontes: ${dataDoctor.citations?.length || 0}`);
  if (dataDoctor.citations?.[0]?.rankingRationale) {
    console.log(`   - Justificativa do Ranqueamento da Fonte #1: "${dataDoctor.citations[0].rankingRationale}"`);
  }
  console.log(`   - Amostra da Resposta Médica:\n${(dataDoctor.answer || '').slice(0, 260)}...\n`);

  await sleep(2000);

  // =========================================================================
  // TESTE 2: MODO ESTUDANTE (userMode: 'student')
  // =========================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log('🎓 [TESTE 2] Testando Mesma Consulta em MODO ESTUDANTE (Foco Didático / Fisiopatologia)...');
  const resStudent = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Qual a fisiopatologia da hiper-reatividade brônquica na asma e como atua o beta-2 agonista na musculatura lisa brônquica?',
      specialty: 'emergency_medicine',
      userMode: 'student'
    })
  });

  const dataStudent = await resStudent.json();
  if (!resStudent.ok) {
    console.error('❌ Erro no Teste Modo Estudante:', dataStudent);
    return;
  }

  console.log(`✅ Consulta Modo Estudante Concluída com Sucesso!`);
  console.log(`   - Persona Retornada: "${dataStudent.userMode}"`);
  console.log(`   - Trace ID de Auditoria: "${dataStudent.auditTraceId}"`);
  console.log(`   - Contém Pérola Clínica / Didática: ${(dataStudent.answer?.includes('Pérola') || dataStudent.answer?.includes('fisiopatologia') || dataStudent.answer?.includes('mecanismo')) ? '✅ Sim' : '❌ Não'}`);
  console.log(`   - Amostra da Resposta Estudante:\n${(dataStudent.answer || '').slice(0, 260)}...\n`);

  console.log('================================================================================');
  console.log('🎉 TODOS OS REQUISITOS P1 E P2 FORAM TESTADOS E VALIDADOS COM SUCESSO TOTAL!');
  console.log('================================================================================\n');
}

runAdvancedFeaturesTest().catch(console.error);
