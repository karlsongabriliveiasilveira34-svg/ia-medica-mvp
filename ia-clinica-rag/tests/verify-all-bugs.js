import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";

const testQueries = [
  {
    id: "TEST-1",
    theme: "Gripe / Influenza",
    query: "Quais são os principais sintomas de gripe e as indicações do uso de oseltamivir?",
    expectedKeywords: ["influenza", "gripe", "síndrome gripal", "oseltamivir"]
  },
  {
    id: "TEST-2",
    theme: "Diabetes Mellitus",
    query: "Quais são os critérios diagnósticos e a 1ª linha de tratamento farmacológico do diabetes mellitus tipo 2?",
    expectedKeywords: ["diabetes", "glicemia", "hba1c", "metformina"]
  },
  {
    id: "TEST-3",
    theme: "Hipertensão Arterial (HAS)",
    query: "Quais as metas pressóricas e medicamentos indicados no tratamento da hipertensão arterial sistêmica?",
    expectedKeywords: ["hipertensão", "pressão arterial", "has", "ieca", "bra", "anlodipino"]
  },
  {
    id: "TEST-4",
    theme: "Fraturas / Traumas Ortopédicos",
    query: "Qual o manejo inicial, analgesia e conduta nas fraturas e traumas ortopédicos na emergência?",
    expectedKeywords: ["fraturas", "ortopédicos", "imobilização", "trauma", "raio-x"]
  },
  {
    id: "TEST-5",
    theme: "Gestação / Pré-Natal",
    query: "Quais os exames de rotina no pré-natal e os sinais de alarme para pré-eclâmpsia na gestação?",
    expectedKeywords: ["pré-natal", "gestação", "pré-eclâmpsia", "pressão arterial", "proteinúria", "preeclampsia", "pregnancy", "prenatal"]
  },
  {
    id: "TEST-6",
    theme: "Infecção do Trato Urinário (ITU)",
    query: "Qual a antibioticoterapia de 1ª linha para cistite aguda não complicada e pielonefrite?",
    expectedKeywords: ["trato urinário", "itu", "cistite", "nitrofurantoína", "fosfomicina", "pielonefrite", "urinary tract", "pyelonephritis"]
  },
  {
    id: "TEST-7",
    theme: "Acidente Vascular Cerebral (AVCi)",
    query: "Qual a janela terapêutica e a dose da alteplase na trombólise do AVC isquêmico agudo?",
    expectedKeywords: ["vascular cerebral", "avci", "trombólise", "alteplase", "nihss", "stroke"]
  },
  {
    id: "TEST-8",
    theme: "Pneumonia Adquirida na Comunidade (PAC)",
    query: "Como aplicar o escore CURB-65 e qual o tratamento empírico da pneumonia comunitária?",
    expectedKeywords: ["pneumonia", "pac", "curb-65", "amoxicilina", "azitromicina", "pulmonary", "respiratory"]
  }
];

const intentTestQueries = [
  {
    id: "INTENT-DUVIDA-GERAL",
    type: "Dúvida Geral Simples",
    query: "Qual a definição teórica de febre segundo a literatura?",
    expectedShowCard: false
  },
  {
    id: "INTENT-CONDUTA-EVIDENCIA",
    type: "Decisão de Tratamento",
    query: "Paciente de 65 anos com diabetes tipo 2 e hemoglobina glicada 8,5%, qual a conduta terapêutica indicada?",
    expectedShowCard: true
  }
];

async function runAcceptanceSuite() {
  console.log("\n================================================================================");
  console.log("🧪 SUÍTE COMPLETA DE TESTES DE ACEITE (BUGS A, B, C e D) — ROUND 3");
  console.log("================================================================================\n");

  const resultsBugA = [];
  const resultsBugB_C = [];

  // 1. Executar Testes do Bug A (8 Temas Distintos) & Bug D (Coerência)
  console.log("--------------------------------------------------------------------------------");
  console.log("📌 Bateria 1: Validação do Retrieval e Coerência de Resposta (Bugs A e D)");
  console.log("--------------------------------------------------------------------------------\n");

  for (const item of testQueries) {
    console.log(`\n▶️ Executando Teste ${item.id} [${item.theme}]: "${item.query}"`);
    try {
      const res = await OrchestratorAgent.processQuery({
        question: item.query,
        topK: 5
      });

      const citations = res.citations || [];
      const titles = citations.map(c => c.title).join(" | ");
      const titlesLower = titles.toLowerCase();
      
      const isMatched = item.expectedKeywords.some(kw => titlesLower.includes(kw));

      resultsBugA.push({
        id: item.id,
        theme: item.theme,
        query: item.query,
        auditTraceId: res.auditTraceId,
        returnedSourcesCount: citations.length,
        topSourceTitle: citations[0]?.title || "Nenhuma",
        matchedExpectedTheme: isMatched ? "✅ SIM (100% Correto)" : "❌ NÃO (Falha)",
        groundednessScore: res.confidence?.score || 0,
        answerSnippet: res.answer ? res.answer.substring(0, 180).replaceAll("\n", " ") + "..." : "Sem resposta"
      });

      console.log(`   Resultado Teste ${item.id}: ${isMatched ? "✅ APROVADO" : "❌ REPROVADO"} | Trace: ${res.auditTraceId}`);
      console.log(`   Fonte Top 1: "${citations[0]?.title}" (Score: ${citations[0]?.supportScore})`);
    } catch (err) {
      console.error(`❌ Erro no teste ${item.id}:`, err.message);
      resultsBugA.push({
        id: item.id,
        theme: item.theme,
        query: item.query,
        auditTraceId: "ERROR",
        returnedSourcesCount: 0,
        topSourceTitle: "ERRO",
        matchedExpectedTheme: "❌ ERRO",
        groundednessScore: 0,
        answerSnippet: err.message
      });
    }
  }

  // 2. Executar Testes de Intenção e Consenso (Bugs B e C)
  console.log("\n--------------------------------------------------------------------------------");
  console.log("📌 Bateria 2: Validação de Consenso Dinâmico e Exibição do Card (Bugs B e C)");
  console.log("--------------------------------------------------------------------------------\n");

  for (const item of intentTestQueries) {
    console.log(`\n▶️ Executando Teste Intenção ${item.id} [${item.type}]: "${item.query}"`);
    try {
      const res = await OrchestratorAgent.processQuery({
        question: item.query,
        topK: 5
      });

      const matrix = res.consensusMatrix || {};
      const cardMatch = matrix.showCard === item.expectedShowCard;

      resultsBugB_C.push({
        id: item.id,
        type: item.type,
        query: item.query,
        intentType: res.intentType,
        showCard: matrix.showCard,
        expectedShowCard: item.expectedShowCard,
        cardMatch: cardMatch ? "✅ APROVADO" : "❌ REPROVADO",
        agreementPercentage: `${matrix.primarySupportPercent}% / ${matrix.alternativeSupportPercent}%`,
        consensusLevel: matrix.consensusLevel
      });

      console.log(`   Resultado ${item.id}: ${cardMatch ? "✅ APROVADO" : "❌ REPROVADO"}`);
      console.log(`   Intenção: ${res.intentType} | Card Exibido: ${matrix.showCard} (Esperado: ${item.expectedShowCard}) | Consenso: ${matrix.primarySupportPercent}%`);
    } catch (err) {
      console.error(`❌ Erro no teste de intenção ${item.id}:`, err.message);
    }
  }

  // 3. Imprimir Tabelas Resumo de Aceite
  console.log("\n================================================================================");
  console.log("📊 RELATÓRIO FINAL DE EVIDÊNCIAS DOS TESTES DE ACEITE (BUG A & BUG D)");
  console.log("================================================================================");
  console.table(resultsBugA.map(r => ({
    "ID": r.id,
    "Tema Médico": r.theme,
    "Trace ID": r.auditTraceId,
    "Fonte Top 1 Retornada": r.topSourceTitle,
    "Tema Bateu?": r.matchedExpectedTheme,
    "Confiança": r.groundednessScore
  })));

  console.log("\n================================================================================");
  console.log("📊 RELATÓRIO FINAL DOS TESTES DE CONSENSO E CARD (BUG B & BUG C)");
  console.log("================================================================================");
  console.table(resultsBugB_C.map(r => ({
    "ID": r.id,
    "Tipo Pergunta": r.type,
    "Intenção": r.intentType,
    "Exibiu Card?": r.showCard,
    "Esperado": r.expectedShowCard,
    "Match Card": r.cardMatch,
    "Percentual Consenso": r.agreementPercentage,
    "Nível de Consenso": r.consensusLevel
  })));

  const totalBugA = resultsBugA.filter(r => r.matchedExpectedTheme.includes("SIM")).length;
  const totalBugB_C = resultsBugB_C.filter(r => r.cardMatch.includes("APROVADO")).length;

  console.log(`\n🏆 PLACAR DE ACEITE FINAL:`);
  console.log(`   Bug A & D (Retrieval 8 Temas): ${totalBugA}/8 Aprovados`);
  console.log(`   Bug B & C (Consenso & Cards): ${totalBugB_C}/${intentTestQueries.length} Aprovados`);

  process.exit(totalBugA === 8 && totalBugB_C === intentTestQueries.length ? 0 : 1);
}

runAcceptanceSuite().catch(err => {
  console.error("❌ Erro fatal ao rodar suíte de testes:", err);
  process.exit(1);
});
