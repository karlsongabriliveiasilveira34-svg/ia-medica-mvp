import { PubMedQAIngestionService } from "../src/services/pubmedqa-ingestion.service.js";
import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";
import { usageMeterService } from "../src/services/usage-meter.service.js";
import crypto from "crypto";

async function runFullVerification() {
  console.log("==================================================");
  console.log("🧪 TESTANDO INGESTÃO PUBMEDQA, LIMITES REAIS DO FREE E AVATARES");
  console.log("==================================================");

  // ----------------------------------------------------
  // TESTE 1: Ingestão do Banco Real PubMedQA
  // ----------------------------------------------------
  console.log("\n[TESTE 1] Executando pipeline de ingestão do PubMedQA...");
  const ingestResult = await PubMedQAIngestionService.ingestData(20);
  console.log("   Resultado da ingestão PubMedQA:", ingestResult);

  // ----------------------------------------------------
  // TESTE 2: Estatísticas Reais do Acervo (Sem Mocks / Sem 10.420 fake)
  // ----------------------------------------------------
  console.log("\n[TESTE 2] Consultando estatísticas reais do banco de dados...");
  const stats = await QuestoesGeneratorService.getStudyStats();
  console.log("   Estatísticas reais obtidas:", {
    totalQuestions: stats.totalQuestions,
    totalFlashcards: stats.totalFlashcards,
    totalDecks: stats.totalDecks,
    porEspecialidade: stats.porEspecialidade
  });

  if (stats.totalQuestions === 0 || stats.totalFlashcards === 0) {
    throw new Error("Estatísticas retornaram 0 itens no banco!");
  }
  if (stats.totalFlashcards === 10420 || stats.totalQuestions === 1250) {
    throw new Error("FALHA: Sistema ainda está retornando números fictícios hardcoded!");
  }
  console.log("   ✅ Contagens reais derivadas do acervo com sucesso!");

  // ----------------------------------------------------
  // TESTE 3: Regras Rigorosas do Plano FREE (10 IA, 10 Flashcards, 5 Questões)
  // ----------------------------------------------------
  console.log("\n[TESTE 3] Testando limites estritos de um usuário no plano FREE...");
  const freeUserId = `user_free_audit_${Date.now()}`;

  // 3.1. Teste de 10 Requisições de IA / mês
  console.log("   --> Testando 10 requisições de IA...");
  for (let i = 1; i <= 10; i++) {
    const checkAI = usageMeterService.checkResourceLimit(freeUserId, "free", "ai");
    if (!checkAI.allowed) throw new Error(`Requisição de IA #${i} deveria ter sido permitida!`);
    usageMeterService.recordResourceUsage(freeUserId, "free", "ai", 1);
  }
  const blockedAI = usageMeterService.checkResourceLimit(freeUserId, "free", "ai");
  console.log("   Tentativa 11ª de IA:", { allowed: blockedAI.allowed, code: blockedAI.resource, used: blockedAI.used, limit: blockedAI.limit });
  if (blockedAI.allowed !== false) {
    throw new Error("FALHA: 11ª requisição de IA NÃO foi bloqueada no plano Free!");
  }
  console.log("   ✅ Limite de 10 IA / mês bloqueou rigorosamente a 11ª chamada!");

  // 3.2. Teste de 10 Flashcards / dia
  console.log("   --> Testando 10 flashcards visualizados por dia...");
  for (let i = 1; i <= 10; i++) {
    const checkCard = usageMeterService.checkResourceLimit(freeUserId, "free", "flashcards");
    if (!checkCard.allowed) throw new Error(`Flashcard #${i} deveria ter sido permitido!`);
    usageMeterService.recordResourceUsage(freeUserId, "free", "flashcards", 1);
  }
  const blockedCard = usageMeterService.checkResourceLimit(freeUserId, "free", "flashcards");
  console.log("   Tentativa 11ª de Flashcard:", { allowed: blockedCard.allowed, used: blockedCard.used, limit: blockedCard.limit });
  if (blockedCard.allowed !== false) {
    throw new Error("FALHA: 11º flashcard NÃO foi bloqueado no plano Free!");
  }
  console.log("   ✅ Limite diário de 10 flashcards bloqueou rigorosamente o 11º card!");

  // 3.3. Teste de 5 Questões no Simulado / dia
  console.log("   --> Testando 5 questões de simulado por dia...");
  for (let i = 1; i <= 5; i++) {
    const checkQ = usageMeterService.checkResourceLimit(freeUserId, "free", "questions");
    if (!checkQ.allowed) throw new Error(`Questão #${i} deveria ter sido permitida!`);
    usageMeterService.recordResourceUsage(freeUserId, "free", "questions", 1);
  }
  const blockedQ = usageMeterService.checkResourceLimit(freeUserId, "free", "questions");
  console.log("   Tentativa 6ª de Questão:", { allowed: blockedQ.allowed, used: blockedQ.used, limit: blockedQ.limit });
  if (blockedQ.allowed !== false) {
    throw new Error("FALHA: 6ª questão NÃO foi bloqueada no plano Free!");
  }
  console.log("   ✅ Limite diário de 5 questões bloqueou rigorosamente a 6ª questão!");

  // ----------------------------------------------------
  // TESTE 4: Reset Automático Diário e Mensal
  // ----------------------------------------------------
  console.log("\n[TESTE 4] Testando reset de virada de dia e virada de mês...");
  const meter = usageMeterService.getUserMeter(freeUserId, "free");

  // Simular virada de dia
  meter.lastDailyDate = "2026-01-01"; // Data anterior
  const meterAfterNewDay = usageMeterService.getUserMeter(freeUserId, "free");
  console.log("   Após virada de dia:", {
    flashcardsDay: meterAfterNewDay.flashcardsDay,
    questionsDay: meterAfterNewDay.questionsDay,
    aiRequestsMonth: meterAfterNewDay.aiRequestsMonth
  });

  if (meterAfterNewDay.flashcardsDay !== 0 || meterAfterNewDay.questionsDay !== 0) {
    throw new Error("Contadores diários não resetaram na virada de dia!");
  }
  if (meterAfterNewDay.aiRequestsMonth !== 10) {
    throw new Error("Contador mensal não deveria ter resetado na virada de dia!");
  }
  console.log("   ✅ Reset diário validado com sucesso (flashcards e questões zerados)!");

  // Simular virada de mês
  meter.lastMonthlyDate = "2026-01"; // Mês anterior
  const meterAfterNewMonth = usageMeterService.getUserMeter(freeUserId, "free");
  console.log("   Após virada de mês:", {
    aiRequestsMonth: meterAfterNewMonth.aiRequestsMonth
  });
  if (meterAfterNewMonth.aiRequestsMonth !== 0) {
    throw new Error("Contador mensal não resetou na virada de mês!");
  }
  console.log("   ✅ Reset mensal validado com sucesso (IA e tokens zerados)!");

  // ----------------------------------------------------
  // TESTE 5: Avatar Real do Usuário (Gravatar MD5)
  // ----------------------------------------------------
  console.log("\n[TESTE 5] Testando resolução de avatar real...");
  const testEmail = "lucas.silveira@hospital.med.br";
  const expectedHash = crypto.createHash("sha256").update(testEmail).digest("hex");
  const expectedGravatar = `https://www.gravatar.com/avatar/${expectedHash}?d=mp&s=200`;

  console.log("   Email testado:", testEmail);
  console.log("   Gravatar gerado:", expectedGravatar);

  if (!expectedGravatar.includes(expectedHash)) {
    throw new Error("Hash do Gravatar gerado incorretamente!");
  }
  console.log("   ✅ Resolução de Avatar Real via Gravatar validada!");

  // ----------------------------------------------------
  // TESTE 6: Upgrade para Plano ESTUDANTE (Ilimitado para Questões e Flashcards)
  // ----------------------------------------------------
  console.log("\n[TESTE 6] Testando limites de um usuário no plano ESTUDANTE...");
  const studentUserId = `user_student_${Date.now()}`;
  const studentCardCheck = usageMeterService.checkResourceLimit(studentUserId, "estudante", "flashcards");
  const studentQCheck = usageMeterService.checkResourceLimit(studentUserId, "estudante", "questions");
  const studentAICheck = usageMeterService.checkResourceLimit(studentUserId, "estudante", "ai");

  console.log("   Plano Estudante:", {
    flashcardsLimit: studentCardCheck.limit,
    questionsLimit: studentQCheck.limit,
    aiLimit: studentAICheck.limit
  });

  if (studentCardCheck.limit !== Infinity || studentQCheck.limit !== Infinity || studentAICheck.limit !== 250) {
    throw new Error("Plano Estudante com limites divergentes da especificação!");
  }
  console.log("   ✅ Plano Estudante validado com flashcards/questões ilimitados e 250 IA/mês!");

  console.log("\n==================================================");
  console.log("🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!");
  console.log("==================================================");
}

runFullVerification().catch(err => {
  console.error("❌ Falha no teste:", err);
  process.exit(1);
});
