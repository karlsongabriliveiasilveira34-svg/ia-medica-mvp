import { emailService } from "../src/services/email.service.js";
import { usageMeterService } from "../src/services/usage-meter.service.js";
import { getBaseUrl } from "../src/routes/auth.routes.js";
import crypto from "crypto";

async function testFreeQuotaAndEmailUrl() {
  console.log("==================================================");
  console.log("🧪 TESTANDO CORREÇÃO DO EMAIL DE PRODUÇÃO E LIMITES DO PLANO FREE");
  console.log("==================================================");

  // ----------------------------------------------------
  // TESTE 1: Garantir que URLs de Email NUNCA apontem para localhost
  // ----------------------------------------------------
  console.log("\n[TESTE 1] Verificando links gerados nos emails...");
  const dummyToken = "token_de_teste_123456";

  // Mock do sendMail para capturar a URL gerada
  let capturedVerifyLink = null;
  const originalSendMail = emailService.sendMail;
  emailService.sendMail = async ({ html, text, to, subject }) => {
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) capturedVerifyLink = match[0];
    return { success: true };
  };

  await emailService.sendVerificationEmail("medico.teste@gmail.com", dummyToken, "Dr. Carlos");

  console.log("   Link capturado no email de verificação:", capturedVerifyLink);
  if (!capturedVerifyLink || capturedVerifyLink.includes("localhost")) {
    throw new Error(`FALHA CRÍTICA: Email gerou link contendo localhost: ${capturedVerifyLink}`);
  }
  if (!capturedVerifyLink.startsWith("https://ia-medica-mvp.vercel.app")) {
    throw new Error(`FALHA: Link deveria começar com o domínio de produção oficial! Obteve: ${capturedVerifyLink}`);
  }
  console.log("   ✅ REGRA VALIDADA: O link de email aponta estritamente para o domínio oficial de produção!");

  // ----------------------------------------------------
  // TESTE 2: getBaseUrl com headers reais de produção
  // ----------------------------------------------------
  console.log("\n[TESTE 2] Testando resolução de domínio com getBaseUrl...");
  const mockReqProd = {
    headers: {
      origin: "https://ia-medica-mvp.vercel.app",
      host: "ia-medica-mvp.vercel.app"
    },
    secure: true
  };
  const baseResolved = getBaseUrl(mockReqProd);
  console.log("   Domínio resolvido via headers:", baseResolved);
  if (baseResolved !== "https://ia-medica-mvp.vercel.app") {
    throw new Error(`Domínio resolvido incorreto: ${baseResolved}`);
  }
  console.log("   ✅ Domínio resolvido com sucesso!");

  // ----------------------------------------------------
  // TESTE 3: Plano FREE inicia com 0/5 requisições e 0/2000 tokens
  // ----------------------------------------------------
  console.log("\n[TESTE 3] Testando cota inicial do usuário no plano FREE...");
  const testUserId = `user_free_${Date.now()}`;
  const initialSummary = usageMeterService.getUsageSummary(testUserId, "free");

  console.log("   Estado inicial do Plano Free:", {
    plano: initialSummary.plan.name,
    requests: `${initialSummary.usage.requestsUsed}/${initialSummary.usage.requestsLimit}`,
    tokens: `${initialSummary.usage.tokensUsed}/${initialSummary.usage.tokensLimit}`,
    canMakeRequest: initialSummary.ui.canMakeRequest,
    colorStatus: initialSummary.ui.colorStatus
  });

  if (initialSummary.usage.requestsUsed !== 0 || initialSummary.usage.tokensUsed !== 0) {
    throw new Error(`Plano FREE não iniciou zerado! requests: ${initialSummary.usage.requestsUsed}`);
  }
  if (initialSummary.usage.requestsLimit !== 5) {
    throw new Error(`Limite de requisições do plano FREE deveria ser 5, obteve: ${initialSummary.usage.requestsLimit}`);
  }
  if (initialSummary.usage.tokensLimit !== 2000) {
    throw new Error(`Limite de tokens do plano FREE deveria ser 2000, obteve: ${initialSummary.usage.tokensLimit}`);
  }
  if (!initialSummary.ui.canMakeRequest) {
    throw new Error("Novo usuário FREE deveria poder fazer requisições!");
  }
  console.log("   ✅ Cota inicial do plano FREE validada (0/5 requisições e 0/2000 tokens)!");

  // ----------------------------------------------------
  // TESTE 4: Consumo progressivo e BLOQUEIO RIGOROSO após 5 requisições
  // ----------------------------------------------------
  console.log("\n[TESTE 4] Simulando envio de mensagens no plano FREE até o limite...");
  for (let i = 1; i <= 5; i++) {
    const state = usageMeterService.recordUsage(testUserId, "free", 350);
    console.log(`   Mensagem #${i} enviada -> Consumo: ${state.usage.requestsUsed}/5 (${state.usage.requestsPercentage}%) | Tokens: ${state.usage.tokensUsed}/2000 | Status: ${state.ui.colorStatus}`);
  }

  const blockedSummary = usageMeterService.getUsageSummary(testUserId, "free");
  console.log("   Estado após 5 mensagens:", {
    requestsUsed: `${blockedSummary.usage.requestsUsed}/${blockedSummary.usage.requestsLimit}`,
    canMakeRequest: blockedSummary.ui.canMakeRequest,
    colorStatus: blockedSummary.ui.colorStatus,
    statusMessage: blockedSummary.ui.statusMessage
  });

  if (blockedSummary.ui.canMakeRequest !== false) {
    throw new Error("FALHA GRAVE: Usuário FREE NÃO FOI BLOQUEADO após atingir 5 requisições!");
  }
  if (blockedSummary.ui.colorStatus !== "blocked") {
    throw new Error(`Status de cor deveria ser 'blocked', obteve: ${blockedSummary.ui.colorStatus}`);
  }
  console.log("   ✅ BLOQUEIO RIGOROSO VALIDADO: Usuário atingiu 5/5 requisições e está 100% bloqueado de fazer novas consultas!");

  // Restaurar método original
  emailService.sendMail = originalSendMail;

  console.log("\n==================================================");
  console.log("🎉 TODOS OS TESTES PASSARAM (EMAIL OFICIAL + COTA FREE 5/5)!");
  console.log("==================================================");
}

testFreeQuotaAndEmailUrl().catch(err => {
  console.error("❌ Falha no teste:", err);
  process.exit(1);
});
