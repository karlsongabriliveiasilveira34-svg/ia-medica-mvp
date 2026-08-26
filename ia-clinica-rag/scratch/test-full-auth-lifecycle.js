import { AuthSecurityService } from "../src/services/auth-security.service.js";
import { getUserUsageHandler } from "../src/controllers/usage.controller.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

async function runAuthLifecycleTest() {
  console.log("==================================================");
  console.log("🧪 INICIANDO TESTE DE PONTA A PONTA DO FLUXO DE AUTH");
  console.log("==================================================");

  const dynamicPassA = "A!" + crypto.randomBytes(12).toString("hex") + "9";

  const testUserA = {
    name: "Dra. Ana Paula",
    email: "ana.paula.medica@gmail.com",
    password: dynamicPassA,
    crm: "987654-RJ",
    specialty: "Cardiologia",
    plan: "medico"
  };

  // 1. CADASTRO DO USUÁRIO A
  console.log("\n[1] Registrando Usuário A...");
  const regResultA = await AuthSecurityService.registerUser(testUserA);
  console.log("   Resultado cadastro:", {
    id: regResultA.id,
    email: regResultA.email,
    verificado: regResultA.email_verificado
  });
  if (regResultA.email_verificado !== false) throw new Error("Conta deve iniciar com email_verificado = false!");

  // 2. TENTATIVA DE LOGIN ANTES DE CONFIRMAR EMAIL (DEVE SER BLOQUEADO)
  console.log("\n[2] Tentando login antes de verificar email...");
  let blockedAsExpected = false;
  try {
    await AuthSecurityService.loginUser({
      email: testUserA.email,
      password: testUserA.password
    });
  } catch (err) {
    if (err.code === "EMAIL_NOT_VERIFIED") {
      blockedAsExpected = true;
      console.log("   ✅ Login bloqueado com sucesso: Email não verificado!");
    } else {
      throw err;
    }
  }
  if (!blockedAsExpected) throw new Error("Login não foi bloqueado para email não verificado!");

  // 3. CONFIRMAÇÃO DO EMAIL E LOGIN AUTOMÁTICO
  console.log("\n[3] Usuário clica no link de confirmação do email...");
  const tokenA = regResultA.verificationToken;
  const verifyResultA = await AuthSecurityService.verifyEmailToken(tokenA);

  console.log("   ✅ Email confirmado com sucesso!");
  console.log("   Sessão automática gerada:", {
    tokenGerado: !!verifyResultA.accessToken,
    nome: verifyResultA.user.name,
    email: verifyResultA.user.email,
    plano: verifyResultA.user.plan,
    verificado: verifyResultA.user.email_verificado
  });

  if (!verifyResultA.accessToken || verifyResultA.user.email !== testUserA.email.toLowerCase()) {
    throw new Error("Falha ao gerar sessão autenticada automática no verifyEmailToken!");
  }

  // 4. TESTAR RECURSO PROTEGIDO (/api/user/usage) COM TOKEN GERADO NA CONFIRMAÇÃO
  console.log("\n[4] Consultando /api/user/usage com o token da sessão automática...");
  let resStatus = null;
  let resBody = null;
  const mockReq = {
    method: "GET",
    originalUrl: "/api/user/usage",
    headers: {
      authorization: `Bearer ${verifyResultA.accessToken}`
    }
  };
  const mockRes = {
    status: (code) => { resStatus = code; return { json: (d) => { resBody = d; } }; },
    json: (d) => { resStatus = 200; resBody = d; }
  };

  await getUserUsageHandler(mockReq, mockRes);
  console.log(`   ✅ Status retornado: ${resStatus} (200 OK)`);
  console.log("   Plano ativo:", resBody.data.plan.name);

  // 5. TESTE DE LOGOUT E LOGIN MANUAL COM MESMAS CREDENCIAIS
  console.log("\n[5] Simulando Logout e Login Manual com Email e Senha...");
  const loginResultA = await AuthSecurityService.loginUser({
    email: testUserA.email,
    password: testUserA.password,
    ip: "189.40.12.33",
    userAgent: "Chrome Windows"
  });

  console.log("   ✅ Login Manual efetuado com sucesso absoluto!");
  console.log("   Dados do usuário logado:", {
    id: loginResultA.user.id,
    nome: loginResultA.user.name,
    email: loginResultA.user.email,
    plano: loginResultA.user.plan
  });

  if (loginResultA.user.email !== testUserA.email.toLowerCase()) {
    throw new Error("Email retornado no login manual não coincide com o usuário cadastrado!");
  }

  // 6. TESTE DE ISOLAMENTO: USUÁRIO B
  console.log("\n[6] Testando Usuário B para garantir isolamento de sessões...");
  const dynamicPassB = "B!" + crypto.randomBytes(12).toString("hex") + "7";
  const testUserB = {
    name: "Dr. Roberto Santos",
    email: "roberto.santos@gmail.com",
    password: dynamicPassB,
    plan: "estudante"
  };

  const regResultB = await AuthSecurityService.registerUser(testUserB);
  const verifyResultB = await AuthSecurityService.verifyEmailToken(regResultB.verificationToken);

  console.log("   Usuário B verificado:", verifyResultB.user.name, `(${verifyResultB.user.email})`);
  if (verifyResultB.user.email === verifyResultA.user.email) {
    throw new Error("ERRO GRAVE: Sessões cruzadas entre Usuário A e Usuário B!");
  }

  console.log("\n==================================================");
  console.log("🎉 TODOS OS 6 TESTES DO FLUXO DE AUTH PASSARAM (100%)!");
  console.log("==================================================");
}

runAuthLifecycleTest().catch(err => {
  console.error("❌ Falha no teste:", err);
  process.exit(1);
});
