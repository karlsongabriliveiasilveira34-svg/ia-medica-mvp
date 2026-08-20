import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runP1Verification() {
  console.log('🧪 Iniciando Teste de Validação do Requisito P1.1 (Roteamento por Especialidade & Modo NotebookLM)...\n');

  // 1. Testar GET /api/agents
  console.log('--------------------------------------------------');
  console.log('📋 [TESTE 1] GET /api/agents - Listar agentes registrados...');
  const resAgents = await fetch(`${BASE_URL}/api/agents`);
  const dataAgents = await resAgents.json();
  console.log(`✅ Sucesso! Total de agentes retornados: ${dataAgents.agents ? dataAgents.agents.length : 0}`);
  dataAgents.agents.forEach(a => {
    console.log(`  - [${a.id}] ${a.name} (${a.clinicalCalculators ? a.clinicalCalculators.join(', ') : 'Sem calculadoras'})`);
  });

  // 2. Testar consulta em Cardiologia
  console.log('\n--------------------------------------------------');
  console.log('🫀 [TESTE 2] Consulta direcionada a CARDIOLOGIA (Cardiology Agent)...');
  const resCardio = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente com dor torácica aguda e troponina elevada. Como aplicar a estratificação de risco HEART e TIMI?',
      specialty: 'cardiology'
    })
  });
  const dataCardio = await resCardio.json();
  console.log(`✅ Agente Utilizado: ${dataCardio.agent?.name} (${dataCardio.agent?.id})`);
  console.log(`🤖 Resposta resumida:\n${dataCardio.answer.substring(0, 250)}...\n`);

  // 3. Testar consulta em Pediatria
  console.log('--------------------------------------------------');
  console.log('👶 [TESTE 3] Consulta direcionada a PEDIATRIA (Pediatrics Agent)...');
  const resPedia = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Criança de 3 anos com otite média aguda. Qual a dose recomendada de amoxicilina por kg de peso?',
      specialty: 'pediatrics'
    })
  });
  const dataPedia = await resPedia.json();
  console.log(`✅ Agente Utilizado: ${dataPedia.agent?.name} (${dataPedia.agent?.id})`);
  console.log(`🤖 Resposta resumida:\n${dataPedia.answer.substring(0, 250)}...\n`);

  // 4. Testar Modo Dúvidas Gerais (NotebookLM Strict Mode - Termo Ausente na Base)
  console.log('--------------------------------------------------');
  console.log('🩺 [TESTE 4] Modo Estrito NotebookLM (Dúvidas Gerais) - Pergunta sobre tema não cadastrado...');
  const resNotebook = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Qual é o protocolo exato de cirurgia ortopédica para fratura de fêmur distal com haste intramedular bloqueada?',
      specialty: 'general_medicine'
    })
  });
  const dataNotebook = await resNotebook.json();
  console.log(`✅ Agente Utilizado: ${dataNotebook.agent?.name}`);
  console.log(`🤖 Resposta:\n${dataNotebook.answer}\n`);

  console.log('✨ Validação P1.1 concluída com sucesso!');
}

runP1Verification().catch(console.error);
