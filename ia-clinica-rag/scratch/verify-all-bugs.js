import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";
import { query } from "../src/config/database.js";

async function runVerification() {
  console.log("================================================================================");
  console.log("🧪 INICIANDO BATERIA DE VERIFICAÇÃO AUTOMATIZADA — BUGS A, B, C e D");
  console.log("================================================================================\n");

  const testCases = [
    {
      id: 1,
      domain: "gripe",
      question: "Quais os sintomas da infecção por Influenza e quando indicar Oseltamivir?",
      expectedKeywords: ["gripe", "influenza", "oseltamivir", "síndrome gripal"]
    },
    {
      id: 2,
      domain: "diabetes",
      question: "Quais os critérios diagnósticos e metas de HbA1c no Diabetes Mellitus Tipo 2?",
      expectedKeywords: ["diabetes", "hba1c", "glicemia", "metformina"]
    },
    {
      id: 3,
      domain: "hipertensão",
      question: "Qual a meta pressórica e fármacos de primeira linha na Hipertensão Arterial Sistêmica?",
      expectedKeywords: ["hipertensão", "pressão arterial", "enalapril", "losartana", "anlodipino"]
    },
    {
      id: 4,
      domain: "fratura",
      question: "Qual a conduta inicial e imobilização em fratura e trauma ortopédico na emergência?",
      expectedKeywords: ["fratura", "ortopédico", "raio-x", "tala", "imobilização"]
    },
    {
      id: 5,
      domain: "gestação",
      question: "Quais os sinais de alerta de pré-eclâmpsia e rotina de exames no acompanhamento pré-natal?",
      expectedKeywords: ["gestação", "pré-natal", "pré-eclâmpsia", "ácido fólico", "proteinúria"]
    },
    {
      id: 6,
      domain: "infecção urinária",
      question: "Qual a conduta e antibioticoterapia de 1ª linha na cistite aguda não complicada e ITU?",
      expectedKeywords: ["infecção do trato urinário", "itu", "cistite", "nitrofurantoína", "fosfomicina"]
    },
    {
      id: 7,
      domain: "AVC",
      question: "Qual a janela terapêutica para trombólise no AVC Isquêmico e avaliação pela escala NIHSS?",
      expectedKeywords: ["avc", "acidente vascular cerebral", "trombólise", "alteplase", "nihss"]
    },
    {
      id: 8,
      domain: "pneumonia",
      question: "Como estratificar a gravidade da pneumonia pela escala CURB-65 e qual o tratamento?",
      expectedKeywords: ["pneumonia", "pac", "curb-65", "amoxicilina", "azitromicina"]
    }
  ];

  const resultsTable = [];
  let bugAPassedCount = 0;

  for (const tc of testCases) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`📌 Teste [${tc.id}/8] — Domínio: ${tc.domain.toUpperCase()}`);
    console.log(`   Pergunta: "${tc.question}"`);

    const result = await OrchestratorAgent.processQuery({
      question: tc.question,
      specialty: "auto",
      topK: 5,
      userMode: "doctor"
    });

    const returnedTitles = (result.citations || []).map(c => c.title);
    const answerTextLower = (result.answer || "").toLowerCase();

    // Validar se o título retornado bate com o tema da pergunta
    const isTopicMatch = returnedTitles.some(t => {
      const tLower = t.toLowerCase();
      return tc.expectedKeywords.some(kw => tLower.includes(kw));
    });

    if (isTopicMatch) bugAPassedCount++;

    resultsTable.push({
      id: tc.id,
      domain: tc.domain,
      question: tc.question,
      returnedSources: returnedTitles.slice(0, 2).join(" | "),
      topicMatch: isTopicMatch ? "✅ APROVADO (100% Tema Bateu)" : "❌ REPROVADO",
      consensusMatrix: result.consensusMatrix ? `${result.consensusMatrix.primarySupportPercent}%` : "NULO (Sem Card)",
      answerSnippet: (result.answer || "").slice(0, 120).replace(/\n/g, " ") + "..."
    });
  }

  console.log("\n================================================================================");
  console.log("📊 TABELA DE EVIDÊNCIA DO TESTE DE ACEITE — BUG A e BUG D (8/8 DOMÍNIOS)");
  console.log("================================================================================");
  console.table(resultsTable);

  console.log(`\n🏆 Resultado Bug A: ${bugAPassedCount}/8 Testes Aprovados com Tema Correto.`);

  // Teste Bug B & C — Perguntas de Dúvida Geral vs Conduta
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🧪 Testando Bug B (Percentual Dinâmico) & Bug C (Ocultação de Card em Dúvida Geral)");
  
  const generalDoubtRes = await OrchestratorAgent.processQuery({
    question: "O que é hemoglobina glicada?",
    specialty: "auto",
    userMode: "doctor"
  });

  console.log(`   📌 Dúvida Geral ("O que é hemoglobina glicada?"):`);
  console.log(`      Card de Consenso Exibido: ${generalDoubtRes.consensusMatrix ? 'SIM (Incorreto)' : 'NÃO (Correto - Null)'}`);

  const conductRes1 = await OrchestratorAgent.processQuery({
    question: "Qual a conduta para tratamento da pneumonia em paciente idoso com CURB-65 3?",
    specialty: "auto",
    userMode: "doctor"
  });

  console.log(`   📌 Pergunta de Conduta #1 (Pneumonia CURB-65=3):`);
  console.log(`      Consenso Percentual: ${conductRes1.consensusMatrix?.primarySupportPercent}%`);

  const conductRes2 = await OrchestratorAgent.processQuery({
    question: "Qual o tratamento de emergência para AVC Isquêmico agudo?",
    specialty: "auto",
    userMode: "doctor"
  });

  console.log(`   📌 Pergunta de Conduta #2 (AVC Isquêmico):`);
  console.log(`      Consenso Percentual: ${conductRes2.consensusMatrix?.primarySupportPercent}%`);

  await query("SELECT 1");
  process.exit(0);
}

runVerification().catch(err => {
  console.error("Erro na verificação:", err);
  process.exit(1);
});
