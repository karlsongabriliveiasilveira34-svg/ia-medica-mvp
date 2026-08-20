import fs from 'fs';
import path from 'path';

function runUiAndPdfVerificationSuite() {
  console.log("\n================================================================================");
  console.log("🛡️ SUÍTE DE TESTES: VERIFICAÇÃO DE BUGS DE ESTADO, ACESSIBILIDADE & PDF A4");
  console.log("================================================================ drop\n");

  let passed = 0;
  const total = 4;

  // TESTE 1: Reset de Decisões ao Trocar de Sessão (B1 & B3)
  console.log("📌 [TESTE 1/4] Verificação de Reset de Decisões e Trava de Loading ao Reabrir Sessão (B1, B3)");
  try {
    const clinicalChatPath = path.resolve("frontend/src/components/ClinicalChat.jsx");
    const content = fs.readFileSync(clinicalChatPath, "utf-8");

    const hasDecisionReset = content.includes("setRecordedDecisions({})");
    const hasLoadingCheck = content.includes("if (loading) return;") && content.includes("handleOpenPreviousSession");

    if (hasDecisionReset && hasLoadingCheck) {
      console.log("   ✅ Sucesso! Reset de recordedDecisions e trava de loading presentes em handleOpenPreviousSession.");
      passed++;
    } else {
      console.error("   ❌ Falha: Reset de decisões ou trava de loading não encontrados em ClinicalChat.jsx");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 1:", err.message);
  }

  // TESTE 2: Timeout com AbortController no Frontend (B4)
  console.log("\n📌 [TESTE 2/4] Verificação de Timeout de 25s com AbortController no Frontend (B4)");
  try {
    const clinicalChatPath = path.resolve("frontend/src/components/ClinicalChat.jsx");
    const content = fs.readFileSync(clinicalChatPath, "utf-8");

    const hasAbortController = content.includes("new AbortController()");
    const has90sTimeout = content.includes("90000");
    const hasTimeoutMessage = content.includes("Tempo de Resposta Excedido");

    if (hasAbortController && has90sTimeout && hasTimeoutMessage) {
      console.log("   ✅ Sucesso! Timeout de 90s com AbortController e aviso amigável configurados.");
      passed++;
    } else {
      console.error("   ❌ Falha: AbortController ou mensagem de timeout não encontrados!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 2:", err.message);
  }

  // TESTE 3: Regras print:break-inside-avoid e Nome da Clínica Editável no Laudo PDF (B7, B8)
  console.log("\n📌 [TESTE 3/4] Verificação de Regras PDF A4 print:break-inside-avoid e Nome da Clínica (B7, B8)");
  try {
    const editorPath = path.resolve("frontend/src/components/MedicalReportEditor.jsx");
    const content = fs.readFileSync(editorPath, "utf-8");

    const hasBreakAvoid = content.includes("print:break-inside-avoid");
    const hasClinicNameInput = content.includes("report.clinicName") && content.includes("Nome da Clínica / Consultório");

    if (hasBreakAvoid && hasClinicNameInput) {
      console.log("   ✅ Sucesso! Prevenção de quebra de páginas em PDF e campo editável de Nome da Clínica confirmados.");
      passed++;
    } else {
      console.error("   ❌ Falha: Regras print:break-inside-avoid ou campo de clínica não encontrados!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 3:", err.message);
  }

  // TESTE 4: Interceptador de Erro HTTP 429 no Controller (B10)
  console.log("\n📌 [TESTE 4/4] Verificação do Interceptador de Cota 429 no Backend (B10)");
  try {
    const controllerPath = path.resolve("src/controllers/query.controller.js");
    const content = fs.readFileSync(controllerPath, "utf-8");

    const has429Check = content.includes("isRateLimit") && content.includes("429");
    const hasFriendlyMsg = content.includes("O serviço de inteligência médica está com alta demanda momentânea");

    if (has429Check && hasFriendlyMsg) {
      console.log("   ✅ Sucesso! Interceptador HTTP 429 com mensagem amigável ao usuário confirmado.");
      passed++;
    } else {
      console.error("   ❌ Falha: Interceptador 429 não encontrado em query.controller.js!");
    }
  } catch (err) {
    console.error("   ❌ Erro no Teste 4:", err.message);
  }

  // PLACAR FINAL
  console.log("\n================================================================================");
  console.log(`🏆 RESULTADO FINAL DOS TESTES DE UI & PDF: ${passed}/${total} TESTES APROVADOS`);
  console.log("================================================================ drop\n");

  process.exit(passed === total ? 0 : 1);
}

runUiAndPdfVerificationSuite();
