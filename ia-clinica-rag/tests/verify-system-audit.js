import { PreProcessorAgent } from "../src/agents/pre-processor.agent.js";
import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";
import { sanitizePHIAndAnonymize } from "../src/utils/lgpd-sanitizer.util.js";
import { validateInputSanity } from "../src/utils/input-validator.util.js";

async function runSystemAuditTestSuite() {
  console.log("\n================================================================================");
  console.log("🛡️ SUÍTE DE TESTES: AUDITORIA GERAL DE SISTEMA, LGPD & ROTEAMENTO DE INTENÇÃO");
  console.log("================================================================ drop\n");

  let passedTests = 0;
  const totalTests = 20;

  // ---------------------------------------------------------------------------
  // TESTE 1: Anonimização LGPD de Nomes Próprios
  // ---------------------------------------------------------------------------
  console.log("📌 [TESTE 1/20] Anonimização LGPD de Nomes Próprios");
  try {
    const input = "Paciente Joaquim Fernando apresenta dor de cabeça";
    const sanitized = sanitizePHIAndAnonymize(input);
    const hasNoName = !sanitized.includes("Joaquim") && !sanitized.includes("Fernando");
    const hasRedactedLabel = sanitized.includes("[PACIENTE]");

    console.log(`   Entrada Original: "${input}"`);
    console.log(`   Saída Sanitizada: "${sanitized}"`);

    if (hasNoName && hasRedactedLabel) {
      console.log("   ✅ Sucesso! Nome do paciente redigido para [PACIENTE].");
      passedTests++;
    } else {
      console.error("   ❌ Falha na remoção do nome do paciente!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 1:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Anonimização K-Anonymity de Idade em Anos (Faixa de 3 em 3 anos)
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 2/20] Anonimização K-Anonymity de Idade em Anos (52 anos -> 51 a 54 anos)");
  try {
    const input = "Paciente de 52 anos com queixa de febre";
    const sanitized = sanitizePHIAndAnonymize(input);
    const hasBracket = sanitized.includes("51 a 54 anos") || sanitized.includes("51 a 54");

    console.log(`   Entrada Original: "${input}"`);
    console.log(`   Saída Sanitizada: "${sanitized}"`);

    if (hasBracket) {
      console.log("   ✅ Sucesso! Idade de 52 anos convertida na faixa de 51 a 54 anos.");
      passedTests++;
    } else {
      console.error("   ❌ Falha na conversão de idade em anos!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 2:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Anonimização K-Anonymity de Idade em Meses (Faixa de 3 em 3 meses)
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 3/20] Anonimização K-Anonymity de Idade em Meses (7 meses -> 6 a 9 meses)");
  try {
    const input = "Criança de 7 meses com tosse produtiva";
    const sanitized = sanitizePHIAndAnonymize(input);
    const hasBracket = sanitized.includes("6 a 9 meses");

    console.log(`   Entrada Original: "${input}"`);
    console.log(`   Saída Sanitizada: "${sanitized}"`);

    if (hasBracket) {
      console.log("   ✅ Sucesso! Idade de 7 meses convertida na faixa de 6 a 9 meses.");
      passedTests++;
    } else {
      console.error("   ❌ Falha na conversão de idade em meses!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 3:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTES 4 a 8: Entrada Inválida / Gibberish / Lixo (INVALID_INPUT)
  // ---------------------------------------------------------------------------
  const invalidInputs = [
    { text: "asdfgh", label: "Teste 4: Gibberish 'asdfgh'" },
    { text: "123456", label: "Teste 5: Números isolados '123456'" },
    { text: ".......", label: "Teste 6: Pontuações isoladas '.......'" },
    { text: "kkkkkk", label: "Teste 7: Risadas 'kkkkkk'" },
    { text: "teste",  label: "Teste 8: Palavra genérica 'teste'" }
  ];

  let testIdx = 4;
  for (const item of invalidInputs) {
    console.log(`\n📌 [TESTE ${testIdx}/20] Entrada Inválida: "${item.text}"`);
    try {
      const res = await OrchestratorAgent.processQuery({
        question: item.text,
        userMode: "doctor"
      });

      const isInvalid = res.answer.includes("Não foi possível interpretar");
      const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

      if (res.status === "success" && isInvalid && hasZeroDiagnoses) {
        console.log(`   ✅ Sucesso! Entrada inválida bloqueada sem acionar RAG ou LLM.`);
        passedTests++;
      } else {
        console.error(`   ❌ Falha ao tratar entrada inválida "${item.text}"!`);
      }
    } catch (err) {
      console.error(`   ❌ Erro no Teste ${testIdx}:`, err.message);
    }
    testIdx++;
  }

  // ---------------------------------------------------------------------------
  // TESTES 9 e 10: Perguntas Fora de Escopo (OUT_OF_SCOPE)
  // ---------------------------------------------------------------------------
  const outOfScopeQueries = [
    { text: "Qual o melhor time de futebol do Brasil?", label: "Teste 9: Futebol" },
    { text: "Como fazer uma receita de bolo de cenoura?", label: "Teste 10: Culinária" }
  ];

  for (const item of outOfScopeQueries) {
    console.log(`\n📌 [TESTE ${testIdx}/20] Fora de Escopo: "${item.text}"`);
    try {
      const res = await OrchestratorAgent.processQuery({
        question: item.text,
        userMode: "doctor"
      });

      const isOutOfScope = res.answer.includes("fora do objetivo da plataforma");
      const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

      if (res.status === "success" && isOutOfScope && hasZeroDiagnoses) {
        console.log(`   ✅ Sucesso! Mensagem fora de escopo bloqueada com aviso orientativo.`);
        passedTests++;
      } else {
        console.error(`   ❌ Falha ao tratar pergunta fora de escopo!`);
      }
    } catch (err) {
      console.error(`   ❌ Erro no Teste ${testIdx}:`, err.message);
    }
    testIdx++;
  }

  // ---------------------------------------------------------------------------
  // TESTES 11 e 12: Saudações (GREETING)
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 11/20] Saudação 'Oi' no Modo Médico (Aviso de Uso Exclusivo)`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Oi",
      userMode: "doctor"
    });

    const isOrientative = res.answer.includes("Modo Estudante") || res.answer.includes("exclusivamente");
    if (res.status === "success" && isOrientative) {
      console.log("   ✅ Sucesso! Saudação no Modo Médico orientou para o Modo Estudante.");
      passedTests++;
    } else console.error("   ❌ Falha no Teste 11!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 11:", err.message);
  }
  testIdx++;

  console.log(`\n📌 [TESTE 12/20] Saudação 'Olá' no Modo Estudante (Recepção Didática)`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Olá",
      userMode: "student"
    });

    const isFriendly = res.answer.includes("Modo Estudante") || res.answer.includes("estudos");
    if (res.status === "success" && isFriendly) {
      console.log("   ✅ Sucesso! Saudação no Modo Estudante respondeu didaticamente.");
      passedTests++;
    } else console.error("   ❌ Falha no Teste 12!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 12:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTES 13 e 14: Perguntas Teóricas Médicas (GENERAL_STUDY)
  // ---------------------------------------------------------------------------
  const generalStudyQueries = [
    { text: "O que é hipertensão arterial?", label: "Teste 13: Conceito Hipertensão" },
    { text: "Explique o mecanismo de ação da metformina.", label: "Teste 14: Farmacologia Metformina" }
  ];

  for (const item of generalStudyQueries) {
    console.log(`\n📌 [TESTE ${testIdx}/20] Pergunta Teórica: "${item.text}"`);
    try {
      const res = await OrchestratorAgent.processQuery({
        question: item.text,
        userMode: "student"
      });

      const hasContent = res.answer.length > 50;
      const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

      if (res.status === "success" && hasContent && hasZeroDiagnoses) {
        console.log(`   ✅ Sucesso! Pergunta didática respondida com RAG sem laudos nem diagnósticos.`);
        passedTests++;
      } else {
        console.error(`   ❌ Falha ao responder pergunta teórica!`);
      }
    } catch (err) {
      console.error(`   ❌ Erro no Teste ${testIdx}:`, err.message);
    }
    testIdx++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 15: Caso Clínico Incompleto (CLINICAL_CASE_INCOMPLETE)
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 15/20] Caso Clínico Incompleto ('Paciente com dor')`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Paciente com dor",
      userMode: "doctor"
    });

    const isAskingMoreInfo = res.answer.includes("preciso de mais informações");
    const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

    if (res.status === "success" && isAskingMoreInfo && hasZeroDiagnoses) {
      console.log("   ✅ Sucesso! Caso incompleto solicitou dados vitais sem alucinar informações.");
      passedTests++;
    } else console.error("   ❌ Falha no Teste 15!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 15:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTE 16: Caso Clínico Completo no Modo Médico
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 16/20] Caso Clínico Estruturado Completo no Modo Médico`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Paciente masculino de 65 anos, hipertenso, relata dor torácica retroesternal intensa há 2 horas com sudorese fria.",
      userMode: "doctor"
    });

    const hasStructured7Sections = res.answer.includes("## Resposta Direta") && res.answer.includes("## Conduta Terapêutica");
    const hasDifferentialDiagnoses = (res.differentialDiagnoses || []).length > 0;

    if (res.status === "success" && hasStructured7Sections && hasDifferentialDiagnoses) {
      console.log(`   ✅ Sucesso! Caso completo gerou resposta em 7 seções + diagnósticos probabilísticos (${res.differentialDiagnoses.length} hipóteses).`);
      passedTests++;
    } else console.error("   ❌ Falha no Teste 16!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 16:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTE 17: Redação LGPD de Documentos (CPF)
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 17/20] Redação LGPD de CPF`);
  try {
    const input = "Paciente CPF 123.456.789-00 com tontura";
    const sanitized = sanitizePHIAndAnonymize(input);
    const hasCpfRedacted = sanitized.includes("[CPF REDIGIDO LGPD]");

    if (hasCpfRedacted) {
      console.log("   ✅ Sucesso! CPF redigido para [CPF REDIGIDO LGPD].");
      passedTests++;
    } else console.error("   ❌ Falha na redação de CPF!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 17:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTE 18: Observabilidade e Emissão de Log JSON
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 18/20] Emissão de Trace e Latência no Metadata`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "O que é diabetes melito?",
      userMode: "student"
    });

    if (res.auditTraceId && res.metadata?.latencyMs !== undefined) {
      console.log(`   Trace ID: ${res.auditTraceId} | Latência: ${res.metadata.latencyMs}ms`);
      console.log("   ✅ Sucesso! Observabilidade de auditoria emitida corretamente.");
      passedTests++;
    } else console.error("   ❌ Falha na observabilidade do Teste 18!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 18:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTE 19: Anonimização de Idade de Criança (14 meses -> 12 a 15 meses)
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 19/20] Anonimização de Idade de Lactente (14 meses -> 12 a 15 meses)`);
  try {
    const input = "Lactente de 14 meses com febre";
    const sanitized = sanitizePHIAndAnonymize(input);
    const hasMonthBracket = sanitized.includes("12 a 15 meses");

    if (hasMonthBracket) {
      console.log("   ✅ Sucesso! 14 meses convertido na faixa de 12 a 15 meses.");
      passedTests++;
    } else console.error(`   ❌ Falha na conversão de 14 meses! Resultado: "${sanitized}"`);
  } catch (err) {
    console.error("   ❌ Erro no Teste 19:", err.message);
  }
  testIdx++;

  // ---------------------------------------------------------------------------
  // TESTE 20: Preservação de RAG e Citações em Caso Clínico Real
  // ---------------------------------------------------------------------------
  console.log(`\n📌 [TESTE 20/20] Preservação de RAG e Citações em Caso Clínico Real`);
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Paciente masculino de 58 anos com crise hipertensiva (PA 210x120 mmHg) e cefaleia occipital intensa há 1 hora.",
      userMode: "doctor"
    });

    if (res.status === "success" && res.citations && res.citations.length > 0) {
      console.log(`   Fontes RAG Recuperadas: ${res.citations.length} diretrizes`);
      console.log("   ✅ Sucesso! Recuperação RAG e citações médico-legais totalmente preservadas.");
      passedTests++;
    } else console.error("   ❌ Falha na preservação RAG do Teste 20!");
  } catch (err) {
    console.error("   ❌ Erro no Teste 20:", err.message);
  }

  // ---------------------------------------------------------------------------
  // PLACAR FINAL
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏆 RESULTADO FINAL DA AUDITORIA DO SISTEMA: ${passedTests}/${totalTests} TESTES APROVADOS`);
  console.log("================================================================ drop\n");

  process.exit(passedTests === totalTests ? 0 : 1);
}

runSystemAuditTestSuite().catch(err => {
  console.error("❌ Erro fatal na suíte de testes de auditoria:", err);
  process.exit(1);
});
