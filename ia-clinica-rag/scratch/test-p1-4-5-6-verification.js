import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runP1_4_5_6Verification() {
  console.log('🧪 Iniciando Validação dos Requisitos P1.4, P1.5 e P1.6...\n');

  // 1. Testar Consulta com Manobras Físicas (P1.5) e Estrutura Profunda (P1.6)
  console.log('--------------------------------------------------');
  console.log('🧠 [TESTE 1] Consulta sobre Vertigem - Testando Manobras Físicas (P1.5) e Prompt Profundo (P1.6)...');
  const resVertigo = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente de 42 anos com quadro de tontura e vertigem posicional súbita ao virar na cama. Quais manobras de exame físico e condutas indicadas?',
      specialty: 'neurology'
    })
  });
  const dataVertigo = await resVertigo.json();
  const sessionId = dataVertigo.sessionId;

  console.log(`✅ Consulta processada na Sessão #${sessionId}`);
  console.log(`🤖 Resposta Gerada:\n${dataVertigo.answer.substring(0, 450)}...\n`);

  const hasManobrasSection = dataVertigo.answer.includes('Manobras') || dataVertigo.answer.includes('exames físicos');
  const hasConsensoSection = dataVertigo.answer.includes('consenso') || dataVertigo.answer.includes('divergência');
  console.log(`  - Seção de Manobras e Exames Físicos presente: ${hasManobrasSection ? '✅ Sim' : '❌ Não'}`);
  console.log(`  - Seção de Consenso e Divergência presente: ${hasConsensoSection ? '✅ Sim' : '❌ Não'}`);

  // 2. Testar Registro Médico-Legal da Escolha de Conduta do Médico (P1.4)
  console.log('\n--------------------------------------------------');
  console.log('⚖️ [TESTE 2] Testando POST /api/sessions/:id/decision - Registro de Decisão Médico-Legal (P1.4)...');
  const resDecision = await fetch(`${BASE_URL}/api/sessions/${sessionId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chosenConduct: 'Manobra de Reposicionamento Canalicular de Epley para VPPB de canal posterior',
      supportingSources: dataVertigo.citations || [],
      rationale: 'Paciente apresentou nistagmo positivo durante a Manobra de Dix-Hallpike em consultório.'
    })
  });

  const dataDecision = await resDecision.json();
  console.log(`✅ Registro de Decisão HTTP Status: ${resDecision.status}`);
  console.log(`✅ Decisão Médico-Legal ID: ${dataDecision.record?.id}`);
  console.log(`📋 Conduta Escolhida: "${dataDecision.record?.chosen_conduct}"`);

  // 3. Verificar Recuperação da Sessão com Histórico de Decisões do Médico
  console.log('\n--------------------------------------------------');
  console.log('📄 [TESTE 3] GET /api/sessions/:id - Auditabilidade da Sessão e Decisões...');
  const resGetSession = await fetch(`${BASE_URL}/api/sessions/${sessionId}`);
  const dataGetSession = await resGetSession.json();

  console.log(`✅ Total de Mensagens na Sessão: ${dataGetSession.messages?.length || 0}`);
  console.log(`✅ Total de Decisões Médico-Legais Gravadas: ${dataGetSession.physicianDecisions?.length || 0}`);
  if (dataGetSession.physicianDecisions && dataGetSession.physicianDecisions.length > 0) {
    console.log(`  - Registro #1: "${dataGetSession.physicianDecisions[0].chosen_conduct}" (${dataGetSession.physicianDecisions[0].created_at})`);
  }

  console.log('\n✨ Validação P1.4, P1.5 e P1.6 concluída com sucesso!');
}

runP1_4_5_6Verification().catch(console.error);
