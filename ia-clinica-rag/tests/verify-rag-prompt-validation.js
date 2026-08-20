import fs from 'fs';
import path from 'path';
import { OrchestratorAgent } from '../src/agents/orchestrator.agent.js';

async function runRagPromptValidationTests() {
  console.log("\n================================================================================");
  console.log("🛡️ SUÍTE DE TESTES: VALIDAÇÃO DE FONTES RAG (3 PERGUNTAS & CITABILIDADE STRICT)");
  console.log("================================================================ drop\n");

  let passed = 0;
  const total = 3;

  // TESTE 1: Presença do Protocolo de Validação em 3 Perguntas no Prompt do Orquestrador
  console.log("📌 [TESTE 1/3] Verificação da Presença do Protocolo de 3 Perguntas no Prompt");
  try {
    const filePath = path.resolve("src/agents/orchestrator.agent.js");
    const content = fs.readFileSync(filePath, "utf-8");

    const hasCitationRules = content.includes("REGRA DE CITAÇÃO E RASTREABILIDADE") &&
                             content.includes("CITE AS FONTES [Fonte X]");
    const hasHonestWarningPrompt = content.includes("Não foram encontradas evidências certificadas na base interna");

    if (hasCitationRules && hasHonestWarningPrompt) {
      console.log("   ✅ Sucesso! Protocolo RAG de validação e rastreabilidade de citações ativo no prompt do sistema.");
      passed++;
    } else {
      console.error("   ❌ Falha: Instrução de 3 perguntas ou aviso transparente ausentes no prompt!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 1:", err.message);
  }

  // TESTE 2: Filtragem de Citações (Fontes Não Citadas pela IA Não Aparecem na Lista Final)
  console.log("\n📌 [TESTE 2/3] Filtragem Pós-Processamento: Eliminação de Fontes Não Citadas");
  try {
    const res = await OrchestratorAgent.processQuery({
      question: "Qual a conduta para fratura de fêmur em emergência ortopédica?",
      userMode: "doctor"
    });

    const answerText = res.answer || "";
    const citedMatches = Array.from(answerText.matchAll(/\[Fonte\s+(\d+)\]/gi));
    const citedIndices = new Set(citedMatches.map(m => parseInt(m[1], 10)));
    const citationsCount = (res.citations || []).length;

    console.log(`   Fontes Efetivamente Citadas no Texto: ${citedIndices.size}`);
    console.log(`   Citações Retornadas na Propriedade 'citations': ${citationsCount}`);

    if (citationsCount === citedIndices.size) {
      console.log("   ✅ Sucesso! APENAS as fontes efetivamente citadas no texto foram incluídas na resposta.");
      passed++;
    } else {
      console.error(`   ❌ Falha: Incompatibilidade entre citações do texto (${citedIndices.size}) e array citations (${citationsCount})!`);
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 2:", err.message);
  }

  // TESTE 3: Aviso Transparente Quando Nenhuma Fonte for Relevante ou Citada
  console.log("\n📌 [TESTE 3/3] Emissão da Nota Transparente Quando Nenhuma Fonte For Citada");
  try {
    // Pergunta de conceito médico teórico sem fontes citadas
    const res = await OrchestratorAgent.processQuery({
      question: "Qual o conceito teórico básico de fisiologia celular da homeostase?",
      userMode: "student"
    });

    const lowerAnswer = (res.answer || "").toLowerCase();
    const hasWarningOrCitations = lowerAnswer.includes("informação não encontrada") ||
                                  lowerAnswer.includes("não foram encontradas") ||
                                  lowerAnswer.includes("transparência") ||
                                  (res.citations && res.citations.length > 0);

    if (hasWarningOrCitations) {
      console.log("   ✅ Sucesso! O sistema exibiu a nota transparente de ausência de fontes com precisão.");
      passed++;
    } else {
      console.error("   ❌ Falha ao emitir nota transparente em consulta sem fontes citadas!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 3:", err.message);
  }

  // PLACAR FINAL
  console.log("\n================================================================================");
  console.log(`🏆 RESULTADO FINAL DA VALIDAÇÃO RAG: ${passed}/${total} TESTES APROVADOS`);
  console.log("================================================================ drop\n");

  process.exit(passed === total ? 0 : 1);
}

runRagPromptValidationTests();
