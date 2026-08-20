import { query } from "../src/config/database.js";
import { RetrievalAgent } from "../src/agents/retrieval.agent.js";
import { SourceValidatorService } from "../src/services/source-validator.service.js";
import { OrchestratorAgent } from "../src/agents/orchestrator.agent.js";

async function runComprehensiveValidation() {
  console.log("================================================================================");
  console.log("🧪 SUÍTE DE TESTES E AUDITORIA: GOVERNANÇA DE FONTES OFICIAIS (NÍVEIS 1 A 5)");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, detail = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail}`);
    }
  }

  // -------------------------------------------------------------------------
  // TESTE 1: Integridade do Catálogo de Fontes Oficiais no PostgreSQL
  // -------------------------------------------------------------------------
  console.log("--- 1. Verificação do Catálogo de Fontes Oficiais no PostgreSQL ---");
  const sourcesRes = await query(`
    SELECT title, organization, authority_level, validation_status, version, canonical_url, url 
    FROM sources 
    WHERE validation_status = 'approved'
    ORDER BY authority_level ASC
  `);

  console.log(`Fontes aprovadas no banco: ${sourcesRes.rows.length}`);
  sourcesRes.rows.forEach((s, idx) => {
    console.log(`  [${idx + 1}] Nível ${s.authority_level}: "${s.title}" (${s.organization}) - v${s.version}`);
  });

  assert(sourcesRes.rows.length >= 6, "Pelo menos 6 diretrizes oficiais catalogadas");
  assert(sourcesRes.rows.some(s => s.authority_level === 4 && (s.organization || "").includes("Ministério da Saúde")), "Presença de PCDT do Ministério da Saúde");
  assert(sourcesRes.rows.some(s => s.authority_level === 4 && (s.organization || "").includes("WHO")), "Presença de Diretriz da OMS / WHO");
  assert(sourcesRes.rows.some(s => s.authority_level === 4 && (s.organization || "").includes("OPAS")), "Presença de Diretriz da OPAS / PAHO");
  assert(sourcesRes.rows.some(s => s.authority_level === 5 && (s.organization || "").includes("MSF")), "Presença de Guia Clínico MSF");

  // -------------------------------------------------------------------------
  // TESTE 2: Deduplicação e Bloqueio de Duplicatas
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Teste de Deduplicação e Bloqueio de Registros Duplicados ---");
  const testDoc = {
    metadata: {
      sourceTitle: "Protocolo Clínico e Diretrizes Terapêuticas — Diabetes Mellitus Tipo 2",
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2024-01-15",
      version: "2024.1",
      url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/pcdt-diabetes-mellitus-tipo-2",
      authorityLevel: 4,
      license: "Domínio Público / Governo Federal do Brasil"
    },
    contentText: "Conteúdo duplicado de teste para verificar integridade"
  };

  const regResult = await SourceValidatorService.registerOfficialSource(testDoc);
  assert(regResult.action === "updated", "Deduplicação identificou fonte idêntica e evitou criar duplicata (action: 'updated')");

  // -------------------------------------------------------------------------
  // TESTE 3: Controle de Versão e Superseding
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Teste de Versionamento e Marcação de Versão Antiga como SUPERSEDED ---");
  const dynamicTitle = `Protocolo de Manejo Clínico da Hipertensão vTest-${Date.now()}`;

  const newVersionDoc = {
    metadata: {
      sourceTitle: dynamicTitle,
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2022-01-01",
      version: "2022.1",
      url: `https://www.gov.br/saude/has-v1-${Date.now()}`,
      authorityLevel: 4
    },
    contentText: `Versão antiga de teste para validação de superseding ${Date.now()}`
  };
  await SourceValidatorService.registerOfficialSource(newVersionDoc);

  const updatedVersionDoc = {
    metadata: {
      sourceTitle: dynamicTitle,
      sourceOrganization: "Ministério da Saúde do Brasil / CONITEC",
      sourceType: "clinical_guideline",
      publicationDate: "2024-05-01",
      version: "2024.1",
      url: `https://www.gov.br/saude/has-v2-${Date.now()}`,
      authorityLevel: 4
    },
    contentText: `Nova versão atualizada com evidências recentes ${Date.now()}`
  };
  await SourceValidatorService.registerOfficialSource(updatedVersionDoc);

  const supersededCheck = await query(
    `SELECT version, validation_status, status FROM sources WHERE title = $1 ORDER BY version ASC`,
    [dynamicTitle]
  );
  assert(
    supersededCheck.rows.some(r => r.version === "2022.1" && r.validation_status === "superseded"),
    "Versão anterior marcada automaticamente como SUPERSEDED"
  );
  assert(
    supersededCheck.rows.some(r => r.version === "2024.1" && r.validation_status === "approved"),
    "Nova versão cadastrada com status APPROVED"
  );

  // -------------------------------------------------------------------------
  // TESTE 4: Recuperação Híbrida e Ranking Multi-Fatorial
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Teste de Recuperação Híbrida e Ranking Multi-Fatorial (PostgreSQL + SciELO + PubMed + Cochrane) ---");
  const retrievedDiabetes = await RetrievalAgent.retrieveHybrid({
    queryText: "Qual a meta de hemoglobina glicada e primeira linha no diabetes tipo 2 no SUS?",
    topK: 6
  });

  console.log(`Trechos recuperados para DM2: ${retrievedDiabetes.length}`);
  retrievedDiabetes.forEach((r, idx) => {
    console.log(`  [${idx + 1}] Score: ${r.evidenceScore} | Nível: ${r.authorityLevel || r.authority_level || 4} | ${r.document_title || r.title}`);
    console.log(`      Emissor: ${r.document_organization || r.organization} | URL: ${r.canonical_url || r.url || 'N/A'}`);
  });

  assert(retrievedDiabetes.length > 0, "Recuperação retornou evidências para Diabetes Mellitus Tipo 2");
  assert(
    retrievedDiabetes.some(r => (r.document_title || r.title || "").toLowerCase().includes("diabetes") && ((r.document_organization || r.organization || "").includes("Ministério da Saúde") || (r.document_title || "").includes("Protocolo Clínico"))),
    "PCDT oficial do Ministério da Saúde recuperado para dúvida de conduta no SUS"
  );

  // -------------------------------------------------------------------------
  // TESTE 5: Ausência Absoluta de Nomes Genéricos
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Teste de Ausência de Fontes Genéricas ou Fabricadas ---");
  const allTitles = retrievedDiabetes.map(r => (r.document_title || r.title || "").toLowerCase());
  const hasGenericTitle = allTitles.some(t => t.includes("banco manual") || t.includes("commondatamodel") || t.includes("biopython"));
  assert(!hasGenericTitle, "Nenhum nome genérico ou diretriz fictícia de pastas de código gerada");

  // -------------------------------------------------------------------------
  // TESTE 6: Geração de Resposta RAG com Rastreabilidade Oficial
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Teste de Resposta RAG com Citação Rastreável de Diretrizes Oficiais ---");
  const ragResponse = await OrchestratorAgent.processQuery({
    question: "Paciente com suspeita de dengue apresentando dor abdominal intensa. Qual a classificação de risco e a conduta de hidratação imediata segundo o Ministério da Saúde?",
    specialty: "general",
    userMode: "doctor"
  });

  console.log("\nTrecho da Resposta Gerada:");
  console.log(ragResponse.answer.substring(0, 450) + "...\n");
  console.log(`Citações auditadas: ${ragResponse.citations.length}`);
  ragResponse.citations.forEach((s, idx) => {
    console.log(`  [Fonte ${idx + 1}] ${s.document_title || s.title} (${s.organization || s.document_organization}) - Página ${s.page_number || 1}`);
  });

  assert(ragResponse.answer.length > 100, "Resposta clínica gerada com sucesso");
  assert(
    ragResponse.citations.some(s => (s.organization || s.document_organization || "").includes("Ministério da Saúde") || (s.title || s.document_title || "").toLowerCase().includes("dengue")),
    "Resposta fundamentada na Diretriz Oficial do Ministério da Saúde"
  );
  assert(!ragResponse.answer.includes("😄") && !ragResponse.answer.includes("🚨"), "Resposta médica formal sem emojis");

  // -------------------------------------------------------------------------
  // SÍNTESE
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`📊 RESULTADO FINAL DA VALIDAÇÃO: ${passedTests}/${totalTests} testes aprovados.`);
  console.log("================================================================================");

  if (passedTests === totalTests) {
    console.log("🚀 SUCESSO TOTAL: A base de conhecimento oficial está 100% validada, auditada e em conformidade!");
  } else {
    console.error("⚠️ ALGUNS TESTES FALHARAM. Verifique os logs acima.");
  }
}

runComprehensiveValidation().catch(console.error).finally(() => process.exit(0));
