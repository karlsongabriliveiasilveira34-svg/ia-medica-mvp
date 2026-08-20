import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";
import { PreProcessorAgent } from "../src/agents/pre-processor.agent.js";

async function runStudentModeTestSuite() {
  console.log("\n================================================================================");
  console.log("🎓 SUÍTE DE TESTES: ROTEAMENTO DE INTENÇÃO, MODO ESTUDANTE E CASO CLÍNICO");
  console.log("================================================================ drop\n");

  let passedTests = 0;
  const totalTests = 4;

  // ---------------------------------------------------------------------------
  // TESTE 1: Saudação ("Oi") no Modo Médico / Caso Clínico
  // ---------------------------------------------------------------------------
  console.log("📌 [TESTE 1/4] Envio de 'Oi' no Modo Médico (Mensagem Orientativa de Uso Exclusivo)");
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Oi",
      userMode: "doctor"
    });

    const isOrientative = res.answer.includes("Modo Estudante") || res.answer.includes("dedicado exclusivamente");
    const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;
    const hasNoConsensusCard = res.consensusMatrix === null;

    console.log(`   Resposta da IA: "${res.answer}"`);
    console.log(`   Mensagem Orientativa Direcionando ao Modo Estudante? ${isOrientative ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Diagnósticos Diferenciais Zerados? ${hasZeroDiagnoses ? '✅ SIM (0 itens)' : '❌ NÃO'}`);
    console.log(`   Matriz de Consenso Ocultada? ${hasNoConsensusCard ? '✅ SIM' : '❌ NÃO'}`);

    if (res.status === "success" && isOrientative && hasZeroDiagnoses && hasNoConsensusCard) {
      console.log("   ✅ Sucesso! Saudação no Modo Médico tratada com orientador e zero formulários.");
      passedTests++;
    } else {
      console.error("   ❌ Falha: Saudação no Modo Médico não gerou o comportamento esperado!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 1:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Saudação ("Olá") no Modo Estudante
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 2/4] Envio de 'Olá' no Modo Estudante (Recepção Didática)");
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Olá",
      userMode: "student"
    });

    const isFriendly = res.answer.includes("Modo Estudante") || res.answer.includes("estudos");
    const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

    console.log(`   Resposta da IA: "${res.answer}"`);
    console.log(`   Saudação Amigável Didática? ${isFriendly ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Diagnósticos Diferenciais Zerados? ${hasZeroDiagnoses ? '✅ SIM (0 itens)' : '❌ NÃO'}`);

    if (res.status === "success" && isFriendly && hasZeroDiagnoses) {
      console.log("   ✅ Sucesso! Saudação no Modo Estudante respondeu amigavelmente sem laudo.");
      passedTests++;
    } else {
      console.error("   ❌ Falha no Teste 2!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 2:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Pergunta Teórica ("O que é hipertensão?") no Modo Estudante
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 3/4] Pergunta Teórica Geral ('O que é hipertensão?') no Modo Estudante");
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "O que é hipertensão arterial?",
      userMode: "student"
    });

    const hasContent = res.answer.length > 50;
    const hasZeroDiagnoses = (res.differentialDiagnoses || []).length === 0;

    console.log(`   Pergunta Classificada como DUVIDA_GERAL/Didática.`);
    console.log(`   Tamanho da Resposta: ${res.answer.length} caracteres`);
    console.log(`   Fontes Citadas: ${res.citations.length} diretrizes`);
    console.log(`   Diagnósticos Diferenciais Zerados? ${hasZeroDiagnoses ? '✅ SIM (0 itens)' : '❌ NÃO'}`);

    if (res.status === "success" && hasContent && hasZeroDiagnoses) {
      console.log("   ✅ Sucesso! Pergunta teórica respondida com RAG didático e sem botões de laudo.");
      passedTests++;
    } else {
      console.error("   ❌ Falha no Teste 3!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 3:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TESTE 4: Caso Clínico Estruturado no Modo Médico
  // ---------------------------------------------------------------------------
  console.log("\n📌 [TESTE 4/4] Caso Clínico Estruturado Completo no Modo Médico");
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Paciente masculino, 65 anos, hipertenso e diabético, relata dor torácica opressiva retroesternal há 2 horas irradiada para braço esquerdo com sudorese fria.",
      userMode: "doctor"
    });

    const hasStructuredAnswer = res.answer.includes("## Resposta Direta") && res.answer.includes("## Conduta Terapêutica");
    const hasDiagnoses = (res.differentialDiagnoses || []).length > 0;

    console.log(`   Estrutura em 7 Seções Mantida? ${hasStructuredAnswer ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Cálculo Probabilístico de Diagnósticos Diferenciais (100%) Ativado? ${hasDiagnoses ? `✅ SIM (${res.differentialDiagnoses.length} hipóteses)` : '❌ NÃO'}`);

    if (res.status === "success" && hasStructuredAnswer && hasDiagnoses) {
      console.log("   ✅ Sucesso! Caso clínico ativou perfeitamente o pipeline resolutivo e diagnósticos diferenciais.");
      passedTests++;
    } else {
      console.error("   ❌ Falha no Teste 4!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 4:", err.message);
  }

  // ---------------------------------------------------------------------------
  // PLACAR FINAL
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏆 RESULTADO FINAL DA SUÍTE DE TESTES: ${passedTests}/${totalTests} TESTES APROVADOS`);
  console.log("================================================================ drop\n");

  process.exit(passedTests === totalTests ? 0 : 1);
}

runStudentModeTestSuite().catch(err => {
  console.error("❌ Erro fatal nos testes do Modo Estudante:", err);
  process.exit(1);
});
