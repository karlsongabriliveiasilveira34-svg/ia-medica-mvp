/**
 * Suíte de Testes de Integração Ponta a Ponta (E2E Real HTTP Verification)
 * Validação rigorosa dos Bugs 1 e 2 contra o endpoint POST /api/query do MedIa.
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runE2ETests() {
  console.log('================================================================================');
  console.log('🚀 INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO PONTA A PONTA (PROVA REAL HTTP)');
  console.log('================================================================================\n');

  const evidenceReport = {
    executedAt: new Date().toISOString(),
    bug1Tests: [],
    bug2SessionTest: null,
    summary: {}
  };

  // --------------------------------------------------------------------------
  // TESTE BUG 1: Validação de 5 Casos Clínicos Reais contra Invenção de Fontes
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('🧪 TESTE BUG 1: Verificação de Fontes Oficiais & Zero Alucinação de Metadados');
  console.log('--------------------------------------------------------------------------------');

  const bug1Queries = [
    {
      id: "Q1",
      topic: "Diabetes Mellitus Tipo 2",
      question: "Qual o tratamento inicial recomendado para diabetes mellitus tipo 2 recém-diagnosticado?",
      specialty: "general"
    },
    {
      id: "Q2",
      topic: "Hipertensão Arterial Sistêmica",
      question: "Quais os critérios diagnósticos e metas de pressão arterial na hipertensão arterial sistêmica?",
      specialty: "cardiology"
    },
    {
      id: "Q3",
      topic: "Dengue com Sinais de Alarme",
      question: "Qual o manejo da dengue com sinais de alarme e classificação de risco?",
      specialty: "infectious"
    },
    {
      id: "Q4",
      topic: "Sepse e Choque Séptico (Bundle 1h)",
      question: "Qual o protocolo para sepse e choque séptico na primeira hora (bundle de 1h)?",
      specialty: "emergency"
    },
    {
      id: "Q5",
      topic: "Atenção Primária / Doenças Crônicas",
      question: "Quais são as diretrizes para rastreamento e manejo de doenças crônicas na atenção primária?",
      specialty: "general"
    }
  ];

  let bug1PassedCount = 0;

  for (const q of bug1Queries) {
    console.log(`\n▶️ [${q.id}] Testando: "${q.question}" (${q.topic})`);
    const startTime = Date.now();
    const { status, data } = await postJSON(`${API_BASE}/query`, {
      question: q.question,
      specialty: q.specialty,
      topK: 5
    });
    const elapsed = Date.now() - startTime;

    const isStatus200 = status === 200;
    const hasAnswer = typeof data.answer === 'string' && data.answer.length > 50;
    const citations = data.citations || [];
    const hasCitations = citations.length > 0;

    // Verificar se as fontes têm títulos reais e nenhum rótulo genérico/inventado
    const genericForbiddenLabels = [
      'diretrizes de banco manual',
      'fonte manual',
      'banco local generico',
      'artigo desconhecido',
      'fonte nao especificada'
    ];

    const hasForbiddenLabels = citations.some(c => 
      genericForbiddenLabels.some(label => (c.title || '').toLowerCase().includes(label) || (c.organization || '').toLowerCase().includes(label))
    );

    // Verificar se a seção ## Fontes e Referências foi renderizada no markdown
    const hasSourcesSectionInAnswer = data.answer && data.answer.includes('## Fontes e Referências');

    const testPassed = isStatus200 && hasAnswer && hasCitations && !hasForbiddenLabels && hasSourcesSectionInAnswer;

    if (testPassed) {
      bug1PassedCount++;
      console.log(`   ✅ SUCESSO (${elapsed}ms) | Trace ID: ${data.auditTraceId}`);
      console.log(`   📚 Fontes Recuperadas e Certificadas (${citations.length}):`);
      citations.forEach((c, idx) => {
        console.log(`      [${idx + 1}] "${c.title}" | Emissor: ${c.organization} | Ano: ${c.year || 'N/A'} | GRADE: ${c.gradeLevel}`);
      });
    } else {
      console.error(`   ❌ FALHA no caso ${q.id}:`, { isStatus200, hasAnswer, hasCitations, hasForbiddenLabels, hasSourcesSectionInAnswer });
    }

    evidenceReport.bug1Tests.push({
      caseId: q.id,
      topic: q.topic,
      question: q.question,
      httpStatus: status,
      auditTraceId: data.auditTraceId,
      latencyMs: elapsed,
      citationCount: citations.length,
      citations: citations.map(c => ({
        id: c.id,
        title: c.title,
        organization: c.organization,
        year: c.year,
        authors: c.authors,
        url: c.url,
        gradeLevel: c.gradeLevel
      })),
      hasSourcesSectionInAnswer,
      passed: testPassed
    });
  }

  // --------------------------------------------------------------------------
  // TESTE BUG 2: Verificação do Fluxo de Sessão Contínua (Follow-up sem Loop)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------------------');
  console.log('🧪 TESTE BUG 2: Verificação de Sessão Contínua e Pergunta de Acompanhamento');
  console.log('--------------------------------------------------------------------------------');

  console.log('\nEtapa 1: Abrindo caso clínico com sintomas iniciais...');
  const turn1Question = "Paciente masculino, 58 anos, hipertenso, relata dor retroesternal em aperto iniciada há 2 horas, irradiada para mandíbula e MSE, associada a sudorese fria.";
  const t1Res = await postJSON(`${API_BASE}/query`, {
    question: turn1Question,
    specialty: "cardiology"
  });

  const sessionId = t1Res.data.sessionId;
  const t1Intent = t1Res.data.intentType;
  const t1DiffCount = (t1Res.data.differentialDiagnoses || []).length;
  console.log(`✅ Etapa 1 Concluída: Sessão Criada: ${sessionId}`);
  console.log(`   - Intenção: ${t1Intent}`);
  console.log(`   - Diagnósticos Diferenciais Calculados: ${t1DiffCount} hipóteses`);
  console.log(`   - Trace ID: ${t1Res.data.auditTraceId}`);

  console.log('\nEtapa 2: Enviando pergunta simples de acompanhamento na MESMA sessão...');
  const turn2Question = "Qual seria o melhor tratamento medicamentoso imediato?";
  const t2Res = await postJSON(`${API_BASE}/query`, {
    sessionId: sessionId,
    question: turn2Question,
    specialty: "cardiology"
  });

  const t2Intent = t2Res.data.intentType;
  const t2DiffCount = (t2Res.data.differentialDiagnoses || []).length;
  const t2Answer = t2Res.data.answer || "";

  // Critérios de Aceite Bug 2:
  // 1. Resposta deve ser status 200
  // 2. Intenção classificada como PERGUNTA_COMPLEMENTAR ou DUVIDA_GERAL (ou intentType condizente)
  // 3. NÃO deve reiniciar a anamnese (sem frases como "para investigar, relate os sintomas")
  // 4. A resposta deve focar diretamente no tratamento do caso coronariano já estabelecido
  const doesNotRestartAnamnesis = !t2Answer.toLowerCase().includes("relate os sintomas do paciente") &&
                                   !t2Answer.toLowerCase().includes("para iniciar a investigação do caso");
  const mentionsCardiacMedication = t2Answer.toLowerCase().includes("nitrato") || 
                                     t2Answer.toLowerCase().includes("aas") || 
                                     t2Answer.toLowerCase().includes("antiplaquetário") ||
                                     t2Answer.toLowerCase().includes("morfina") ||
                                     t2Answer.toLowerCase().includes("oxigênio") ||
                                     t2Answer.toLowerCase().includes("betabloqueador");

  const bug2Passed = t2Res.status === 200 && 
                     (t2Intent === 'PERGUNTA_COMPLEMENTAR' || t2Intent === 'DUVIDA_GERAL' || t2Intent === 'CONTINUACAO_CASO') &&
                     doesNotRestartAnamnesis &&
                     mentionsCardiacMedication;

  console.log(`\nResultados da Etapa 2:`);
  console.log(`   - Status HTTP: ${t2Res.status}`);
  console.log(`   - Intenção Classificada: ${t2Intent}`);
  console.log(`   - Recálculo de Diagnósticos: ${t2DiffCount === 0 ? 'SUPRIMIDO (Correto para Follow-up)' : `${t2DiffCount} hipóteses`}`);
  console.log(`   - Resposta focou no tratamento coronariano: ${mentionsCardiacMedication ? 'SIM' : 'NÃO'}`);
  console.log(`   - Anamnese NÃO foi reiniciada: ${doesNotRestartAnamnesis ? 'SIM' : 'NÃO'}`);
  console.log(`   - Trace ID: ${t2Res.data.auditTraceId}`);

  if (bug2Passed) {
    console.log('\n✅ TESTE BUG 2 APROVADO COM SUCESSO!');
  } else {
    console.error('\n❌ TESTE BUG 2 FALHOU.');
  }

  evidenceReport.bug2SessionTest = {
    sessionId,
    turn1: {
      question: turn1Question,
      intentType: t1Intent,
      differentialDiagnosesCount: t1DiffCount,
      traceId: t1Res.data.auditTraceId
    },
    turn2: {
      question: turn2Question,
      intentType: t2Intent,
      differentialDiagnosesCount: t2DiffCount,
      traceId: t2Res.data.auditTraceId,
      answerSnippet: t2Answer.slice(0, 500)
    },
    passed: bug2Passed
  };

  evidenceReport.summary = {
    bug1Result: `${bug1PassedCount}/${bug1Queries.length} Casos Aprovados`,
    bug2Result: bug2Passed ? 'APROVADO' : 'FALHOU',
    allPassed: (bug1PassedCount === bug1Queries.length) && bug2Passed
  };

  // Salvar relatório de evidências em JSON
  const evidencePath = path.join(process.cwd(), 'scratch', 'test-e2e-evidence.json');
  fs.writeFileSync(evidencePath, JSON.stringify(evidenceReport, null, 2), 'utf-8');
  console.log(`\n📄 Relatório de Evidências gerado em: ${evidencePath}`);

  console.log('\n================================================================================');
  console.log(`🏁 RESULTADO FINAL DA BATERIA E2E: ${evidenceReport.summary.allPassed ? 'TODOS OS TESTES APROVADOS (100%)' : 'HOUVE FALHAS'}`);
  console.log('================================================================================\n');

  return evidenceReport.summary.allPassed;
}

runE2ETests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Erro fatal durante a execução dos testes E2E:', err);
  process.exit(1);
});
