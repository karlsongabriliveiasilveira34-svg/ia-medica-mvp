/**
 * ====================================================================
 * 🧪 SUÍTE DE TESTES: NOVOS RECURSOS CLÍNICOS E DATASETS (RuMedQ & Dept-Q-Bank)
 * ====================================================================
 * 
 * Valida:
 * 1. Integração e normalização dos flashcards RuMedQ
 * 2. Integração e normalização das questões Dept-Q-Bank
 * 3. Motor farmacológico de Interações Medicamentosas
 * 4. Ambient AI Scribe (Prontuário SOAP a partir de diálogo)
 * 5. Visão Multimodal para ECG e Exames Laboratoriais
 * 6. Estatísticas Dinâmicas Reais com os novos acervos
 */

import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";
import { DrugInteractionService } from "../src/services/drug-interaction.service.js";
import { AmbientScribeService } from "../src/services/ambient-scribe.service.js";
import { MultimodalVisionService } from "../src/services/multimodal-vision.service.js";
import { RUMEDQ_FLASHCARDS, DEPT_Q_BANK_QUESTIONS } from "../src/database/rumedq-deptq.seed.js";
import { normalizeQuestion, normalizeFlashcard } from "../src/adapters/question-flashcard.adapter.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${testName} — ${details}`);
  }
}

async function runAdvancedAudit() {
  console.log("\n" + "=".repeat(80));
  console.log("🩺 AUDITORIA DOS NOVOS RECURSOS CLÍNICOS E DATASETS (RuMedQ & Dept-Q-Bank)");
  console.log("=".repeat(80) + "\n");

  // ==========================================================================
  // BATERIA 1: DATASET RuMedQ & FLASHCARDS MÉDICOS
  // ==========================================================================
  console.log("-".repeat(80));
  console.log("📌 BATERIA 1: DATASET RuMedQ E BARALHOS DE FLASHCARDS");
  console.log("-".repeat(80));

  assert(Array.isArray(RUMEDQ_FLASHCARDS) && RUMEDQ_FLASHCARDS.length >= 8, "RUMEDQ-1.1: Dataset RuMedQ importado com 8+ cards de alta relevância");

  const normalizedRuMed = RUMEDQ_FLASHCARDS.map((f, i) => normalizeFlashcard(f, i + 1)).filter(Boolean);
  assert(normalizedRuMed.length === RUMEDQ_FLASHCARDS.length, "RUMEDQ-1.2: 100% dos flashcards RuMedQ normalizados via Adapter");
  assert(normalizedRuMed.every(f => f.front && f.back && f.hash.length === 64), "RUMEDQ-1.3: Todos os cards possuem frente, verso e hash SHA-256");

  // Testar listagem via QuestoesGeneratorService
  const cardioList = await QuestoesGeneratorService.listFlashcards({ deckId: "cardio", limit: 50 });
  const hasRuMedQInCardio = cardioList.flashcards.some(c => (c.source || "").includes("RuMedQ") || (c.front || "").includes("RuMedQ") || (c.front || "").includes("Propedêutica"));
  assert(hasRuMedQInCardio, "RUMEDQ-1.4: Flashcards RuMedQ devidamente vinculados ao baralho 'cardio'");

  // ==========================================================================
  // BATERIA 2: DATASET Dept-Q-Bank & QUESTÕES DEPARTAMENTAIS
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 2: DATASET Dept-Q-Bank E BANCO DE QUESTÕES");
  console.log("-".repeat(80));

  assert(Array.isArray(DEPT_Q_BANK_QUESTIONS) && DEPT_Q_BANK_QUESTIONS.length >= 5, "DEPTQ-2.1: Dataset Dept-Q-Bank importado com questões departamentais");

  const normalizedDept = DEPT_Q_BANK_QUESTIONS.map((q, i) => normalizeQuestion(q, i + 1)).filter(Boolean);
  assert(normalizedDept.length === DEPT_Q_BANK_QUESTIONS.length, "DEPTQ-2.2: 100% das questões do Dept-Q-Bank normalizadas via Adapter");
  assert(normalizedDept.every(q => q.options.length === 4 && q.hash.length === 64), "DEPTQ-2.3: Todas as questões possuem 4 alternativas e hash SHA-256");

  // Testar consulta via QuestoesGeneratorService
  const questList = await QuestoesGeneratorService.listQuestions({ limit: 50 });
  const hasDeptQInList = questList.questoes.some(q => (q.source || "").includes("Dept-Q-Bank"));
  assert(hasDeptQInList, "DEPTQ-2.4: Questões do Dept-Q-Bank indexadas e disponíveis na API de questões");

  // ==========================================================================
  // BATERIA 3: MOTOR DE INTERAÇÕES MEDICAMENTOSAS
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 3: MOTOR FARMACOLÓGICO DE INTERAÇÕES MEDICAMENTOSAS");
  console.log("-".repeat(80));

  // 3.1 Interação Grave: Enalapril + Espironolactona (Hipercalemia)
  const check1 = DrugInteractionService.checkInteractions(["Enalapril 20mg", "Espironolactona 25mg"]);
  assert(check1.hasInteractions === true && check1.severityLevel === "GRAVE", "DRUG-3.1: Detecção de Hipercalemia Severa (Enalapril + Espironolactona)");

  // 3.2 Interação Grave: Varfarina + Ibuprofeno (Hemorragia)
  const check2 = DrugInteractionService.checkInteractions(["Varfarina Sódica 5mg", "Ibuprofeno 600mg"]);
  assert(check2.hasInteractions === true && check2.severityLevel === "GRAVE", "DRUG-3.2: Detecção de Risco Hemorrágico Grave (Varfarina + Ibuprofeno)");

  // 3.3 Interação Grave: Fluoxetina + Tramadol (Síndrome Serotoninérgica)
  const check3 = DrugInteractionService.checkInteractions(["Fluoxetina 20mg", "Cloridrato de Tramadol 50mg"]);
  assert(check3.hasInteractions === true && check3.severityLevel === "GRAVE", "DRUG-3.3: Detecção de Síndrome Serotoninérgica (Fluoxetina + Tramadol)");

  // 3.4 Interação Grave: Sildenafila + Isossorbida (Hipotensão Refratária)
  const check4 = DrugInteractionService.checkInteractions(["Sildenafila 50mg", "Mononitrato de Isossorbida 20mg"]);
  assert(check4.hasInteractions === true && check4.severityLevel === "GRAVE", "DRUG-3.4: Detecção de Choque Vasodilatador (Sildenafila + Nitrato)");

  // 3.5 Prescrição Segura: Dipirona + Amoxicilina
  const checkSafe = DrugInteractionService.checkInteractions(["Dipirona 500mg", "Amoxicilina 500mg"]);
  assert(checkSafe.hasInteractions === false && checkSafe.severityLevel === "SEGURO", "DRUG-3.5: Prescrição compatível classificada como Segura");

  // ==========================================================================
  // BATERIA 4: AMBIENT AI CLINICAL SCRIBE (SOAP GENERATOR)
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 4: AMBIENT AI CLINICAL SCRIBE (GERAÇÃO DE SOAP)");
  console.log("-".repeat(80));

  const sampleDialogue = `Médico: Bom dia, o que o traz à consulta hoje?
Paciente: Doutor, estou com uma tosse com catarro amarelado e febre de 38.5 há 3 dias, além de dor no peito para respirar.
Médico: Tem histórico de algum problema de saúde ou fuma?
Paciente: Fumo há 15 anos, não tomo remédios contínuos e não tenho alergias.
Médico: Vou examinar o senhor. Murmúrio diminuído na base direita com estertores crepitantes. PA 120/80, SatO2 96%. Vamos iniciar antibiótico e repouso.`;

  const soapResult = await AmbientScribeService.generateSoapFromDialogue({
    dialogueText: sampleDialogue,
    patientName: "João da Silva",
    doctorName: "Dr. Carlos Santos",
    specialty: "Pneumologia"
  });

  assert(soapResult.status === "success", "SCRIBE-4.1: Processamento de áudio/diálogo executado com sucesso");
  assert(soapResult.soapText.includes("SUBJETIVO") && soapResult.soapText.includes("OBJETIVO"), "SCRIBE-4.2: Seções S e O presentes no prontuário");
  assert(soapResult.soapText.includes("AVALIAÇÃO") && soapResult.soapText.includes("PLANO"), "SCRIBE-4.3: Seções A e P presentes no prontuário");

  // ==========================================================================
  // BATERIA 5: VISÃO MULTIMODAL (ECG & EXAMES LABORATORIAIS)
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 5: VISÃO MULTIMODAL DE ECG E LAUDOS DE EXAME");
  console.log("-".repeat(80));

  const mockBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

  const ecgReport = await MultimodalVisionService.analyzeMedicalImage({
    imageBase64: mockBase64,
    mimeType: "image/jpeg",
    modality: "ecg",
    clinicalContext: "Homem de 58 anos com dor precordial típica há 2 horas"
  });

  assert(ecgReport.status === "success" && ecgReport.modality === "ecg", "VISION-5.1: Análise de traçado de ECG executada com sucesso");
  assert(ecgReport.reportMarkdown && ecgReport.reportMarkdown.length > 50, "VISION-5.2: Laudo estruturado de ECG gerado com recomendações");

  const labReport = await MultimodalVisionService.analyzeMedicalImage({
    imageBase64: mockBase64,
    mimeType: "image/jpeg",
    modality: "lab_exam",
    clinicalContext: "Paciente na UTI com suspeita de sepse"
  });

  assert(labReport.status === "success" && labReport.modality === "lab_exam", "VISION-5.3: OCR de exame laboratorial executado com sucesso");

  // ==========================================================================
  // BATERIA 6: ESTATÍSTICAS DINÂMICAS EXPANDIDAS
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 6: ESTATÍSTICAS DINÂMICAS REAIS DO NOVO ACERVO");
  console.log("-".repeat(80));

  const finalStats = await QuestoesGeneratorService.getStudyStats();
  assert(finalStats.totalQuestions >= 20, `STATS-6.1: Acervo expandido para ${finalStats.totalQuestions} questões reais`);
  assert(finalStats.totalFlashcards >= 26, `STATS-6.2: Acervo expandido para ${finalStats.totalFlashcards} flashcards reais`);

  // ==========================================================================
  // RELATÓRIO FINAL
  // ==========================================================================
  console.log("\n" + "=".repeat(80));
  console.log("📊 RESULTADO DOS TESTES DOS NOVOS RECURSOS CLÍNICOS E DATASETS");
  console.log("=".repeat(80));
  console.log(`Total de Testes Executados: ${totalTests}`);
  console.log(`Testes Aprovados: ${passedTests}`);
  console.log(`Testes com Falha: ${failedTests}`);
  console.log(`Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log("\n🎉 TODOS OS 6 PILARES DE RECURSOS CLÍNICOS E DATASETS FORAM AUDITADOS E APROVADOS COM SUCESSO!");
  } else {
    console.error(`\n⚠️ ${failedTests} TESTE(S) APRESENTARAM FALHA.`);
  }
}

runAdvancedAudit().catch(err => {
  console.error("Erro fatal ao rodar testes:", err);
});
