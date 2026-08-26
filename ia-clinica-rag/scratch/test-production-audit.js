import { getUserUsageHandler } from "../src/controllers/usage.controller.js";
import { emailService } from "../src/services/email.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

async function runProductionAuditTest() {
  console.log("==================================================");
  console.log("🧪 INICIANDO TESTE DA AUDITORIA DE PRODUÇÃO");
  console.log("==================================================");

  // 1. Teste de /api/user/usage Não Autenticado (401 esperado)
  console.log("\n[TESTE 1] /api/user/usage sem token...");
  let resStatus = null;
  let resBody = null;

  const mockReqUnauth = {
    method: "GET",
    originalUrl: "/api/user/usage",
    headers: {}
  };
  const mockResUnauth = {
    status: (code) => {
      resStatus = code;
      return {
        json: (data) => { resBody = data; }
      };
    },
    json: (data) => {
      resStatus = 200;
      resBody = data;
    }
  };

  await getUserUsageHandler(mockReqUnauth, mockResUnauth);
  console.log(`✅ Status retornado: ${resStatus} (Esperado 401)`);
  if (resStatus !== 401) throw new Error(`Esperado 401, obtido ${resStatus}`);

  // 2. Teste de /api/user/usage Autenticado (200 esperado com summary)
  console.log("\n[TESTE 2] /api/user/usage com token válido...");
  const validToken = jwt.sign({
    userId: "user_audit_123",
    email: "medico.teste@gmail.com",
    plan: "medico"
  }, JWT_SECRET, { expiresIn: "1h" });

  const mockReqAuth = {
    method: "GET",
    originalUrl: "/api/user/usage",
    headers: {
      authorization: `Bearer ${validToken}`
    }
  };
  const mockResAuth = {
    status: (code) => {
      resStatus = code;
      return { json: (data) => { resBody = data; } };
    },
    json: (data) => {
      resStatus = 200;
      resBody = data;
    }
  };

  await getUserUsageHandler(mockReqAuth, mockResAuth);
  console.log(`✅ Status retornado: ${resStatus} (Esperado 200)`);
  if (resStatus !== 200) throw new Error(`Esperado 200, obtido ${resStatus}`);
  console.log("   Dados de uso retornados:", {
    plano: resBody.data.plan.name,
    requisicoes_usadas: resBody.data.usage.requestsUsed,
    limite: resBody.data.usage.requestsLimit
  });

  // 3. Teste de Envio de Email com logs de accepted/rejected
  console.log("\n[TESTE 3] Envio de Email com logs estruturados...");
  const emailRes = await emailService.sendMail({
    to: "karlsongabriliveiasilveira34@gmail.com",
    subject: "🧪 Teste Auditoria MedIA",
    text: "Verificação de logs e accepted"
  });
  console.log("   Resultado do email:", emailRes);

  console.log("\n==================================================");
  console.log("🎉 AUDITORIA CONCLUÍDA COM 100% DE SUCESSO!");
  console.log("==================================================");
}

runProductionAuditTest().catch(err => {
  console.error("❌ Falha no teste de auditoria:", err);
  process.exit(1);
});
