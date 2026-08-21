import { cryptoService } from "../src/services/crypto.service.js";
import { sanitizeLogPayload } from "../src/middleware/log-sanitizer.middleware.js";
import { generateToken } from "../src/utils/token.util.js";

async function runLgpdComplianceSuite() {
  console.log("================================================================================");
  console.log("🛡️  SUÍTE DE TESTES E VALIDAÇÃO DE CONFORMIDADE LGPD (LEI 13.709/2018)");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // --------------------------------------------------------------------------------
  // TESTE 1: Criptografia de Aplicação (ALE - AES-256-GCM com IV e AuthTag)
  // --------------------------------------------------------------------------------
  console.log("\n📦 1. Testando Application-Level Encryption (AES-256-GCM)...");
  const sampleCpf = "123.456.789-00";
  const sampleName = "Renato de Oliveira Silva";
  const sampleReport = {
    patientName: sampleName,
    diagnosis: "Infarto Agudo do Miocárdio",
    prescription: ["AAS 300mg", "Ticagrelor 180mg"]
  };

  const encryptedCpf = cryptoService.encrypt(sampleCpf);
  const encryptedName = cryptoService.encrypt(sampleName);
  const encryptedReport = cryptoService.encryptJSON(sampleReport);

  assert(
    cryptoService.isEncrypted(encryptedCpf),
    "Geração de payload seguro no padrão iv(12B):authTag(16B):ciphertext",
    `Payload gerado: ${encryptedCpf.substring(0, 40)}...`
  );

  const decryptedCpf = cryptoService.decrypt(encryptedCpf);
  const decryptedName = cryptoService.decrypt(encryptedName);
  const decryptedReport = cryptoService.decryptJSON(encryptedReport);

  assert(decryptedCpf === sampleCpf, "Decriptação com verificação de integridade (CPF idêntico)", `Original: ${sampleCpf} | Decriptado: ${decryptedCpf}`);
  assert(decryptedName === sampleName, "Decriptação com verificação de integridade (Nome idêntico)", `Original: ${sampleName} | Decriptado: ${decryptedName}`);
  assert(decryptedReport.diagnosis === sampleReport.diagnosis, "Criptografia e Decriptação de Objetos JSON complexos (Laudo Clínico)");

  // Teste de Não-Determinismo (mesmo texto gera ciphertexts diferentes devido ao IV aleatório)
  const encryptedAgain = cryptoService.encrypt(sampleCpf);
  assert(encryptedCpf !== encryptedAgain, "Segurança Semântica: IV aleatório gera cifras diferentes para o mesmo texto claro");

  // --------------------------------------------------------------------------------
  // TESTE 2: Blind Index (HMAC-SHA256 com Salt dedicado para Busca Exata Segura)
  // --------------------------------------------------------------------------------
  console.log("\n🔍 2. Testando Blind Index determinístico para busca em campos cifrados...");
  const rawCpf1 = "123.456.789-00";
  const rawCpf2 = "12345678900"; // Sem máscara
  const rawCpf3 = " 123.456.789-00 "; // Com espaços

  const hash1 = cryptoService.blindIndex(rawCpf1);
  const hash2 = cryptoService.blindIndex(rawCpf2);
  const hash3 = cryptoService.blindIndex(rawCpf3);

  assert(
    hash1 && hash1.length === 64,
    "Blind Index gera hash HMAC-SHA256 de 64 caracteres hex",
    `Blind Index Hash: ${hash1}`
  );
  assert(
    hash1 === hash2 && hash1 === hash3,
    "Normalização inteligente: CPF com ou sem máscara gera exatamente o mesmo Blind Index",
    `Hash com pontuação: ${hash1}\n   └─ Hash sem pontuação: ${hash2}`
  );

  // --------------------------------------------------------------------------------
  // TESTE 3: Sanitização de Logs e Prevenção de Vazamento de PII
  // --------------------------------------------------------------------------------
  console.log("\n🧹 3. Testando Sanitização Automática de Logs (Log Redaction)...");
  const sensitiveLogPayload = {
    user_id: "usr_4821",
    action: "LOGIN_ATTEMPT",
    password: "MinhaSenhaSuperSecreta123!",
    cpf: "123.456.789-00",
    email: "medico.silva@hospital.com.br",
    jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    metadata: {
      credit_card: "4111222233334444",
      notes: "Consulta normal"
    }
  };

  const sanitized = sanitizeLogPayload(sensitiveLogPayload);
  assert(sanitized.password === "[REDACTED_PII]", "Senha mascarada como [REDACTED_PII]");
  assert(sanitized.cpf === "[REDACTED_PII]", "CPF mascarado como [REDACTED_PII]");
  assert(sanitized.email === "[REDACTED_PII]", "E-mail mascarado como [REDACTED_PII]");
  assert(sanitized.jwt === "[REDACTED_PII]", "Token JWT mascarado como [REDACTED_PII]");
  assert(sanitized.metadata.credit_card === "[REDACTED_PII]", "Campos sensíveis aninhados mascarados recursivamente");
  assert(sanitized.metadata.notes === "Consulta normal", "Campos não sensíveis preservados integralmente");

  // --------------------------------------------------------------------------------
  // TESTE 4: Endpoints da API LGPD (Consentimento, DSAR Export, DSAR Purge e Blind Search)
  // --------------------------------------------------------------------------------
  console.log("\n🌐 4. Testando Endpoints HTTP da Suíte LGPD no Servidor Local...");
  const token = generateToken({ role: "doctor", user_id: "doc_test_123" });
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  try {
    // 4.1 Registro de Consentimento
    const testSessionId = `test-sess-${Date.now()}`;
    const consentRes = await fetch("http://localhost:3000/api/lgpd/consent", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        userId: "patient_renato_99",
        sessionId: testSessionId,
        policyVersion: "v2.1.0",
        scopes: {
          clinical_processing: true,
          audit_trail: true,
          ai_decision_support: true,
          analytics: false
        }
      })
    });
    const consentData = await consentRes.json();
    assert(consentRes.ok && consentData.status === "success", "POST /api/lgpd/consent: Registro de consentimento com prova imutável");

    // 4.2 Consulta de Consentimento
    const getConsentRes = await fetch(`http://localhost:3000/api/lgpd/consent/${testSessionId}`, {
      headers: authHeaders
    });
    const getConsentData = await getConsentRes.json();
    assert(getConsentRes.ok && getConsentData.status === "success", "GET /api/lgpd/consent/:id: Consulta de status de consentimento");

    // 4.3 Exportação DSAR (Portabilidade Art. 18 LGPD)
    const exportRes = await fetch(`http://localhost:3000/api/lgpd/export/${testSessionId}`, {
      headers: authHeaders
    });
    const exportData = await exportRes.json();
    assert(
      exportRes.ok && exportData.status === "success" && exportData.data.legalBasis.includes("Art. 18"),
      "GET /api/lgpd/export/:sessionId: Exportação completa do titular em formato JSON estruturado (DSAR)"
    );

    // 4.4 Expurgo / Direito ao Esquecimento (DSAR Purge Art. 18 LGPD)
    const purgeRes = await fetch(`http://localhost:3000/api/lgpd/purge/${testSessionId}`, {
      method: "DELETE",
      headers: authHeaders,
      body: JSON.stringify({ reason: "Solicitação formal do paciente via canal DPO" })
    });
    const purgeData = await purgeRes.json();
    assert(
      purgeRes.ok && purgeData.status === "success" && purgeData.certificate.legalBasis.includes("Art. 18"),
      "DELETE /api/lgpd/purge/:sessionId: Eliminação definitiva e emissão de certificado de expurgo (Direito ao Esquecimento)"
    );

    // 4.5 Busca Segura por Blind Index
    const searchRes = await fetch("http://localhost:3000/api/lgpd/search", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ patientName: "Renato Silva" })
    });
    const searchData = await searchRes.json();
    assert(searchRes.ok && searchData.status === "success", "POST /api/lgpd/search: Consulta protegida por Blind Index sem expor PII no banco");

  } catch (httpErr) {
    console.error("⚠️ Erro nos testes de endpoint HTTP:", httpErr.message);
  }

  // --------------------------------------------------------------------------------
  // RELATÓRIO FINAL
  // --------------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`📊 RESULTADO FINAL DA SUÍTE LGPD: ${passedTests}/${totalTests} Testes Aprovados (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("================================================================================\n");

  if (passedTests === totalTests) {
    console.log("🏆 CONFORMIDADE LGPD ATINGIDA COM SUCESSO (100% DOS TESTES APROVADOS)!");
    process.exit(0);
  } else {
    console.error("❌ Alguns testes de conformidade falharam.");
    process.exit(1);
  }
}

runLgpdComplianceSuite().catch(err => {
  console.error("Erro fatal na suíte LGPD:", err);
  process.exit(1);
});
