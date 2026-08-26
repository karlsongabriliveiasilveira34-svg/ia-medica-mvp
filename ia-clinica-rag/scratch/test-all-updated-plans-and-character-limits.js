import { PLANS_CONFIG, usageMeterService } from "../src/services/usage-meter.service.js";
import { validateMessageLength, PLAN_CHARACTER_LIMITS } from "../src/middleware/security-sanitizer.middleware.js";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTANDO ESPECIFICAÇÕES ATUALIZADAS DE TODOS OS PLANOS E LIMITES DE CARACTERES");
  console.log("==================================================");

  // -------------------------------------------------------------------------
  // TESTE 1: PLANO FREE (10 req/mês, 10 cards/dia, 5 questões/dia, 2.000 chars)
  // -------------------------------------------------------------------------
  console.log("\n[TESTE 1] Validando Plano FREE...");
  const freeConfig = PLANS_CONFIG.free;
  console.log("   Configuração Free:", {
    requestsLimit: freeConfig.requestsLimit,
    flashcardsDailyLimit: freeConfig.flashcardsDailyLimit,
    questionsDailyLimit: freeConfig.questionsDailyLimit,
    maxCharsPerMsg: freeConfig.maxCharsPerMsg
  });

  if (freeConfig.requestsLimit !== 10 || freeConfig.flashcardsDailyLimit !== 10 || freeConfig.questionsDailyLimit !== 5 || freeConfig.maxCharsPerMsg !== 2000) {
    throw new Error("Configuração do Plano Free divergente da especificação!");
  }

  // Testar limite de caracteres Free (2.000 chars)
  const validFreeText = "A".repeat(1999);
  const invalidFreeText = "A".repeat(2001);
  const freePass = validateMessageLength(validFreeText, "free");
  const freeFail = validateMessageLength(invalidFreeText, "free");

  if (!freePass.valid) throw new Error("Mensagem de 1.999 caracteres deveria ter passado no Free!");
  if (freeFail.valid) throw new Error("Mensagem de 2.001 caracteres deveria ter sido bloqueada no Free!");
  console.log("   ✅ Plano FREE validado com sucesso (2.000 chars, 10 IA, 10 cards, 5 questões)!");

  // -------------------------------------------------------------------------
  // TESTE 2: PLANO ESTUDANTE (300 req/mês, 150 cards/dia, 100 questões/dia, 10.000 chars)
  // -------------------------------------------------------------------------
  console.log("\n[TESTE 2] Validando Plano ESTUDANTE...");
  const estudanteConfig = PLANS_CONFIG.estudante;
  console.log("   Configuração Estudante:", {
    requestsLimit: estudanteConfig.requestsLimit,
    flashcardsDailyLimit: estudanteConfig.flashcardsDailyLimit,
    questionsDailyLimit: estudanteConfig.questionsDailyLimit,
    maxCharsPerMsg: estudanteConfig.maxCharsPerMsg
  });

  if (estudanteConfig.requestsLimit !== 300 || estudanteConfig.flashcardsDailyLimit !== 150 || estudanteConfig.questionsDailyLimit !== 100 || estudanteConfig.maxCharsPerMsg !== 10000) {
    throw new Error("Configuração do Plano Estudante divergente da especificação!");
  }

  // Testar limite de caracteres Estudante (10.000 chars)
  const validEstudanteText = "B".repeat(9999);
  const invalidEstudanteText = "B".repeat(10001);
  const estPass = validateMessageLength(validEstudanteText, "estudante");
  const estFail = validateMessageLength(invalidEstudanteText, "estudante");

  if (!estPass.valid) throw new Error("Mensagem de 9.999 caracteres deveria ter passado no Estudante!");
  if (estFail.valid) throw new Error("Mensagem de 10.001 caracteres deveria ter sido bloqueada no Estudante!");
  console.log("   ✅ Plano ESTUDANTE validado com sucesso (10.000 chars, 300 IA, 150 cards, 100 questões)!");

  // -------------------------------------------------------------------------
  // TESTE 3: PLANO MÉDICO (900 req/mês, ILIMITADO cards e questões, 20.000 chars)
  // -------------------------------------------------------------------------
  console.log("\n[TESTE 3] Validando Plano MÉDICO...");
  const medicoConfig = PLANS_CONFIG.medico;
  console.log("   Configuração Médico:", {
    requestsLimit: medicoConfig.requestsLimit,
    flashcardsDailyLimit: medicoConfig.flashcardsDailyLimit,
    questionsDailyLimit: medicoConfig.questionsDailyLimit,
    maxCharsPerMsg: medicoConfig.maxCharsPerMsg
  });

  if (medicoConfig.requestsLimit !== 900 || medicoConfig.flashcardsDailyLimit !== Infinity || medicoConfig.questionsDailyLimit !== Infinity || medicoConfig.maxCharsPerMsg !== 20000) {
    throw new Error("Configuração do Plano Médico divergente da especificação!");
  }

  // Testar limite de caracteres Médico (20.000 chars)
  const validMedicoText = "C".repeat(19999);
  const invalidMedicoText = "C".repeat(20001);
  const medPass = validateMessageLength(validMedicoText, "medico");
  const medFail = validateMessageLength(invalidMedicoText, "medico");

  if (!medPass.valid) throw new Error("Mensagem de 19.999 caracteres deveria ter passado no Médico!");
  if (medFail.valid) throw new Error("Mensagem de 20.001 caracteres deveria ter sido bloqueada no Médico!");
  console.log("   ✅ Plano MÉDICO validado com sucesso (20.000 chars, 900 IA, cards/questões ilimitados)!");

  // -------------------------------------------------------------------------
  // TESTE 4: PLANO CLÍNICA (ILIMITADO requisições, cards e questões, 50.000 chars)
  // -------------------------------------------------------------------------
  console.log("\n[TESTE 4] Validando Plano CLÍNICA...");
  const clinicaConfig = PLANS_CONFIG.clinica;
  console.log("   Configuração Clínica:", {
    requestsLimit: clinicaConfig.requestsLimit,
    flashcardsDailyLimit: clinicaConfig.flashcardsDailyLimit,
    questionsDailyLimit: clinicaConfig.questionsDailyLimit,
    maxCharsPerMsg: clinicaConfig.maxCharsPerMsg
  });

  if (clinicaConfig.requestsLimit !== Infinity || clinicaConfig.flashcardsDailyLimit !== Infinity || clinicaConfig.questionsDailyLimit !== Infinity || clinicaConfig.maxCharsPerMsg !== 50000) {
    throw new Error("Configuração do Plano Clínica divergente da especificação!");
  }

  // Testar limite de caracteres Clínica (50.000 chars)
  const validClinicaText = "D".repeat(49999);
  const invalidClinicaText = "D".repeat(50001);
  const cliPass = validateMessageLength(validClinicaText, "clinica");
  const cliFail = validateMessageLength(invalidClinicaText, "clinica");

  if (!cliPass.valid) throw new Error("Mensagem de 49.999 caracteres deveria ter passado na Clínica!");
  if (cliFail.valid) throw new Error("Mensagem de 50.001 caracteres deveria ter sido bloqueada na Clínica!");
  console.log("   ✅ Plano CLÍNICA validado com sucesso (50.000 chars, IA/cards/questões ILIMITADOS)!");

  // -------------------------------------------------------------------------
  // TESTE 5: Teste Funcional de Consumo de Cota do Estudante (Até 300 IA)
  // -------------------------------------------------------------------------
  console.log("\n[TESTE 5] Testando consumo funcional no Plano Estudante...");
  const testEstudanteUser = `user_estudante_test_${Date.now()}`;
  
  // Flashcards: permitido até 150
  for (let i = 1; i <= 150; i++) {
    const c = usageMeterService.checkResourceLimit(testEstudanteUser, "estudante", "flashcards");
    if (!c.allowed) throw new Error(`Flashcard #${i} deveria ter sido permitido no Estudante!`);
    usageMeterService.recordResourceUsage(testEstudanteUser, "estudante", "flashcards", 1);
  }
  const estCard151 = usageMeterService.checkResourceLimit(testEstudanteUser, "estudante", "flashcards");
  if (estCard151.allowed !== false) {
    throw new Error("151º flashcard deveria ter sido bloqueado no Plano Estudante!");
  }
  console.log("   ✅ Limite diário de 150 flashcards no Plano Estudante validado!");

  // Questões: permitido até 100
  for (let i = 1; i <= 100; i++) {
    const q = usageMeterService.checkResourceLimit(testEstudanteUser, "estudante", "questions");
    if (!q.allowed) throw new Error(`Questão #${i} deveria ter sido permitida no Estudante!`);
    usageMeterService.recordResourceUsage(testEstudanteUser, "estudante", "questions", 1);
  }
  const estQ101 = usageMeterService.checkResourceLimit(testEstudanteUser, "estudante", "questions");
  if (estQ101.allowed !== false) {
    throw new Error("101ª questão deveria ter sido bloqueada no Plano Estudante!");
  }
  console.log("   ✅ Limite diário de 100 questões no Plano Estudante validado!");

  console.log("\n==================================================");
  console.log("🎉 TODOS OS 5 TESTES DOS PLANOS PASSARAM COM 100% DE SUCESSO!");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("❌ Falha:", err);
  process.exit(1);
});
