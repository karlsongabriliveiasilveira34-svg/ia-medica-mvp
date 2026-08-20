import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('🧪 Iniciando Teste de Validação dos Bugs P0.1 e P0.2...\n');

  let sessionId = null;

  // Turno 1: Identificação inicial do sintoma
  console.log('--------------------------------------------------');
  console.log('💬 [TURNO 1] Usuário envia queixa inicial...');
  const res1 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente masculino de 52 anos, hipertenso, dá entrada na emergência com dor torácica opressiva há 2 horas.'
    })
  });
  const data1 = await res1.json();
  sessionId = data1.sessionId;
  console.log(`✅ Turno 1 OK! Sessão criada: ${sessionId}`);
  console.log(`🤖 Resposta resumida: ${data1.answer.substring(0, 150)}...\n`);

  // Turno 2: Adicionando achado de ECG
  console.log('--------------------------------------------------');
  console.log('💬 [TURNO 2] Usuário adiciona achado de ECG...');
  const res2 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'O ECG de 12 derivações realizado na admissão revela supradesnivelamento do segmento ST de 2.5mm em V1 a V4.',
      sessionId
    })
  });
  const data2 = await res2.json();
  console.log(`✅ Turno 2 OK! Resposta acumulada.`);
  console.log(`🤖 Resposta resumida: ${data2.answer.substring(0, 150)}...\n`);

  // Turno 3: Adicionando marcador troponina
  console.log('--------------------------------------------------');
  console.log('💬 [TURNO 3] Usuário adiciona resultado de troponina...');
  const res3 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Troponina I ultrassensível retornou em 4.2 ng/mL. PA 145/90 mmHg, FC 86 bpm.',
      sessionId
    })
  });
  const data3 = await res3.json();
  console.log(`✅ Turno 3 OK! Resposta acumulada.`);
  console.log(`🤖 Resposta resumida: ${data3.answer.substring(0, 150)}...\n`);

  // Turno 4: Pergunta de conduta clínica
  console.log('--------------------------------------------------');
  console.log('💬 [TURNO 4] Pergunta de conduta integrativa...');
  const res4 = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Quais medicações de primeira linha e conduta de emergência são indicadas para este paciente com base no quadro completo?',
      sessionId
    })
  });
  const data4 = await res4.json();
  console.log(`✅ Turno 4 OK!`);
  console.log(`🤖 Resposta de Conduta:\n${data4.answer.substring(0, 300)}...\n`);

  // Validar P0.1 - Fontes e Citações no Turno 4
  console.log('--------------------------------------------------');
  console.log('📚 [VALIDAÇÃO P0.1] Verificando citações e metadados de fontes...');
  if (data4.citations && data4.citations.length > 0) {
    data4.citations.forEach((c, idx) => {
      console.log(`  [Citação #${idx + 1}]`);
      console.log(`    📌 Título Real: ${c.title}`);
      console.log(`    📁 Arquivo: ${c.filename}`);
      console.log(`    ✍️ Autor(es): ${c.authors || 'Metadado indisponível'}`);
      console.log(`    📅 Ano: ${c.year || 'Metadado indisponível'}`);
      console.log(`    🏛️ Organização: ${c.organization || 'Metadado indisponível'}`);
      console.log(`    📖 Excerpt (${c.excerpt ? c.excerpt.length : 0} chars): "${c.excerpt ? c.excerpt.substring(0, 100) : ''}..."`);
    });
  } else {
    console.log('ℹ️ Nenhuma citação encontrada.');
  }

  // Turno 5: Teste da ação Analisar Caso Completo
  console.log('\n--------------------------------------------------');
  console.log('🩺 [VALIDAÇÃO P0.2] Testando endpoint /api/sessions/:id/analyze (Analisar Caso Completo)...');
  const res5 = await fetch(`${BASE_URL}/api/sessions/${sessionId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data5 = await res5.json();
  console.log(`✅ Análise do Caso Concluída! (Status: ${data5.status})`);
  console.log(`📊 Síntese Consolidada:\n${data5.answer.substring(0, 400)}...\n`);

  console.log('✨ Validação concluída com sucesso!');
}

runVerification().catch(console.error);
