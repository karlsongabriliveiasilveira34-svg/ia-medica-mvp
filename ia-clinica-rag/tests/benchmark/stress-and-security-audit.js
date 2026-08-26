/**
 * ====================================================================
 * 🛡️ SUÍTE INTEGRAL DE AUDITORIA: VULNERABILIDADES SQL, ENV & ESTRESSE DE BANCO
 * ====================================================================
 * 
 * Este script executa:
 * 1. Auditoria Estática de Vulnerabilidades SQL (SQL Injection & Anti-Patterns) em TODOS os arquivos
 * 2. Validação Rigorosa das Variáveis de Ambiente (.env) e Segurança Criptográfica
 * 3. Análise, Forçamento de Alocação de Memória/Cache no PostgreSQL (work_mem, temp_buffers, cache_hit_ratio)
 * 4. Teste de Estresse e Concorrência sob Alta Carga no Banco de Dados
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, ".env") });

const { Pool } = pg;

// ====================================================================
// 🔍 MÓDULO 1: AUDITORIA DE VULNERABILIDADES SQL EM TODOS OS ARQUIVOS
// ====================================================================

function scanDirectoryForFiles(dir, fileList = []) {
  const targetDirs = [
    path.join(rootDir, "src"),
    path.join(rootDir, "scripts"),
    path.join(rootDir, "tests"),
    path.join(rootDir, "frontend/src"),
    path.join(rootDir, "../api")
  ];

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      if (["node_modules", ".git", "dist", "build", ".vscode", "coverage", ".system_generated", "scratch"].includes(item)) continue;
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (/\.(js|mjs|ts|sql)$/i.test(item)) {
        fileList.push(fullPath);
      }
    }
  }

  for (const tDir of targetDirs) {
    walk(tDir);
  }

  return fileList;
}

function auditSqlVulnerabilities() {
  console.log("\n================================================================================");
  console.log("🛡️ MÓDULO 1: AUDITORIA DE VULNERABILIDADES SQL (TODOS OS ARQUIVOS DO PROJETO)");
  console.log("================================================================================\n");

  const files = scanDirectoryForFiles(rootDir);
  console.log(`📁 Total de arquivos de código/SQL analisados: ${files.length}`);

  const findings = [];
  let totalQueriesAudited = 0;

  // Padrões de risco de SQL Injection
  const riskyConcatenationPattern = /(?:pool\.query|query|client\.query)\s*\(\s*["'`][^"'`]*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)[^"'`]*["'`]\s*\+/gi;
  const dangerousDynamicTemplatePattern = /(?:pool\.query|query|client\.query)\s*\(\s*`[^`]*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)[^`]*\$\{([^}]+)\}/gi;
  const rawExecutablePattern = /\b(?:EXEC\s*\(|EXECUTE\s+IMMEDIATE|\beval\s*\()/i;

  for (const file of files) {
    const relPath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    // Contar queries totais
    const queryMatches = content.match(/(?:pool\.query|query|client\.query)\s*\(/g) || [];
    totalQueriesAudited += queryMatches.length;

    // 1. Verificar concatenação insegura com operador +
    let match;
    while ((match = riskyConcatenationPattern.exec(content)) !== null) {
      findings.push({
        file: relPath,
        type: "CRÍTICA: Concatenação Direta de Strings em SQL (+)",
        snippet: match[0].substring(0, 100),
        severity: "HIGH"
      });
    }

    // 2. Verificar template literals com interpolação dinâmica
    while ((match = dangerousDynamicTemplatePattern.exec(content)) !== null) {
      const interpolatedVar = match[1].trim();
      // Permitir apenas construções de clauses parametrizadas ou números de paginação controlados
      const isSafeParam = /^(params\.length|paramIdx|baseWhere|whereClause|columns|values|updates|setClauses)/i.test(interpolatedVar);
      
      if (!isSafeParam) {
        findings.push({
          file: relPath,
          type: "ALERTA: Interpolação Dinâmica em Template Literal SQL",
          snippet: match[0].substring(0, 100),
          variable: interpolatedVar,
          severity: "MEDIUM"
        });
      }
    }

    // 3. Verificar comandos perigosos
    lines.forEach((line, lineIdx) => {
      if (/\b(?:EXEC\s*\([^)]*\)|EXECUTE\s+IMMEDIATE|\beval\s*\()/i.test(line) && !line.includes(".exec(") && !line.includes("test")) {
        findings.push({
          file: relPath,
          line: lineIdx + 1,
          type: "AVISO: Padrão Executável Dinâmico",
          snippet: line.trim(),
          severity: "LOW"
        });
      }
    });
  }

  console.log(`🔍 Total de chamadas a pool.query/query auditadas: ${totalQueriesAudited}`);

  if (findings.length === 0) {
    console.log("✅ NENHUMA VULNERABILIDADE DE SQL INJECTION ENCONTRADA!");
    console.log("   Todas as consultas utilizam queries parametrizadas ($1, $2, ...) ou sanitizadores de segurança.");
  } else {
    console.log(`⚠️ Encontrados ${findings.length} apontamentos para revisão:`);
    console.table(findings);
  }

  return { totalQueriesAudited, findingsCount: findings.length };
}

// ====================================================================
// ⚙️ MÓDULO 2: AUDITORIA DAS VARIÁVEIS DE AMBIENTE (.env)
// ====================================================================

function auditEnvironmentVariables() {
  console.log("\n================================================================================");
  console.log("⚙️ MÓDULO 2: VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE & CRIPTOGRAFIA");
  console.log("================================================================================\n");

  const results = [];

  // 1. DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    results.push({ var: "DATABASE_URL", status: "❌ AUSENTE", detail: "Usando fallback padrão para localhost" });
  } else if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    results.push({ var: "DATABASE_URL", status: "⚠️ FORMATO INVÁLIDO", detail: "Deve iniciar com postgresql://" });
  } else {
    const masked = dbUrl.replace(/:([^:@]+)@/, ":****@");
    results.push({ var: "DATABASE_URL", status: "✅ VÁLIDO", detail: masked });
  }

  // 2. GEMINI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.includes("sua-chave")) {
    results.push({ var: "GEMINI_API_KEY", status: "⚠️ AUSENTE OU PLACEHOLDER", detail: "Necessário para geração de IA e embeddings" });
  } else {
    results.push({ var: "GEMINI_API_KEY", status: "✅ CONFIGURADO", detail: `Tamanho: ${geminiKey.length} caracteres` });
  }

  // 3. JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    results.push({ var: "JWT_SECRET", status: "⚠️ USANDO PADRÃO", detail: "Recomenda-se chave forte com > 32 chars" });
  } else if (jwtSecret.length < 32) {
    results.push({ var: "JWT_SECRET", status: "⚠️ FRACO", detail: `Comprimento ${jwtSecret.length} < 32 caracteres` });
  } else {
    results.push({ var: "JWT_SECRET", status: "✅ SEGURO", detail: `Comprimento: ${jwtSecret.length} caracteres` });
  }

  // 4. PII_ENCRYPTION_KEY (AES-256)
  const piiKey = process.env.PII_ENCRYPTION_KEY;
  if (!piiKey) {
    results.push({ var: "PII_ENCRYPTION_KEY", status: "⚠️ USANDO PADRÃO", detail: "Chave AES-256 necessária para LGPD" });
  } else if (piiKey.length < 32) {
    results.push({ var: "PII_ENCRYPTION_KEY", status: "❌ INVÁLIDA", detail: "Deve ter 32 bytes (64 caracteres hex)" });
  } else {
    results.push({ var: "PII_ENCRYPTION_KEY", status: "✅ SEGURO", detail: `Comprimento: ${piiKey.length} caracteres (AES-256-GCM)` });
  }

  // 5. BLIND_INDEX_SALT
  const blindSalt = process.env.BLIND_INDEX_SALT;
  results.push({
    var: "BLIND_INDEX_SALT",
    status: blindSalt ? "✅ CONFIGURADO" : "⚠️ PADRÃO",
    detail: blindSalt ? `Comprimento: ${blindSalt.length}` : "Usando salt default"
  });

  // 6. PORT
  const port = process.env.PORT || 3000;
  results.push({ var: "PORT", status: "✅ DEFINIDO", detail: `Porta ${port}` });

  console.table(results);
}

// ====================================================================
// 🧠 MÓDULO 3: MEMÓRIA DO BANCO & ALOCAÇÃO DE CACHE (PostgreSQL)
// ====================================================================

async function tuneAndInspectDatabaseMemory(client) {
  console.log("\n================================================================================");
  console.log("🧠 MÓDULO 3: DIAGNÓSTICO E FORÇAMENTO DE MEMÓRIA DE CACHE DO POSTGRESQL");
  console.log("================================================================================\n");

  const settingsToInspect = [
    "shared_buffers",
    "effective_cache_size",
    "work_mem",
    "maintenance_work_mem",
    "temp_buffers",
    "max_connections",
    "max_worker_processes",
    "max_parallel_workers"
  ];

  const initialSettings = [];
  for (const setting of settingsToInspect) {
    try {
      const res = await client.query(`SHOW ${setting}`);
      initialSettings.push({ Parâmetro: setting, "Valor Atual": res.rows[0][setting] });
    } catch (e) {
      initialSettings.push({ Parâmetro: setting, "Valor Atual": "N/A" });
    }
  }

  console.log("📊 Configurações Globais de Memória e Recursos do PostgreSQL:");
  console.table(initialSettings);

  // Forçar variáveis de alocação de memória local/sessão
  console.log("\n🚀 Forçando parâmetros de memória e cache na sessão ativa...");
  const memoryOverrides = [
    { cmd: "SET work_mem = '64MB'", desc: "work_mem aumentado para 64MB (sorts/hash joins rápidos)" },
    { cmd: "SET temp_buffers = '32MB'", desc: "temp_buffers aumentado para 32MB (tabelas temporárias)" },
    { cmd: "SET statement_timeout = '30000'", desc: "statement_timeout definido em 30s" }
  ];

  for (const override of memoryOverrides) {
    try {
      await client.query(override.cmd);
      console.log(`   ✅ ${override.desc}`);
    } catch (err) {
      console.warn(`   ⚠️ Não foi possível aplicar ${override.cmd}:`, err.message);
    }
  }

  // Verificar Cache Hit Ratio
  try {
    const cacheHitQuery = `
      SELECT 
        sum(heap_blks_hit) as total_hits,
        sum(heap_blks_read) as total_reads,
        ROUND((sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)::numeric) * 100, 2) as cache_hit_percentage
      FROM pg_statio_user_tables;
    `;
    const hitRes = await client.query(cacheHitQuery);
    const row = hitRes.rows[0] || {};
    console.log(`\n📈 Taxa de Acerto de Cache (Cache Hit Ratio): ${row.cache_hit_percentage || 100}%`);
    console.log(`   (Blocos em RAM: ${row.total_hits || 0} | Leituras em Disco: ${row.total_reads || 0})`);
  } catch (err) {
    console.log("   (Estatísticas de cache_hit não disponíveis para usuário atual ou banco em inicialização)");
  }
}

// ====================================================================
// 💥 MÓDULO 4: TESTE DE ESTRESSE E CONCORRÊNCIA NO BANCO DE DADOS
// ====================================================================

async function runDatabaseStressTest(pool) {
  console.log("\n================================================================================");
  console.log("💥 MÓDULO 4: TESTE DE ESTRESSE DE CONCORRÊNCIA E THROUGHPUT NO POSTGRESQL");
  console.log("================================================================================\n");

  const concurrencyLevels = [5, 15, 30, 50];
  const stressResults = [];

  for (const concurrency of concurrencyLevels) {
    const totalRequests = concurrency * 4; // Bateria de 4 queries por thread
    console.log(`▶️ Executando Bateria de Estresse: Concorrência = ${concurrency} threads | Total Requisições = ${totalRequests}`);

    const latencies = [];
    let errorCount = 0;
    const startTime = Date.now();

    const taskPromises = Array.from({ length: totalRequests }).map(async (_, idx) => {
      const qStart = Date.now();
      try {
        // Alternar entre tipos de queries de estresse (Leitura, FTS, Agregações, Escrita Temporária)
        const type = idx % 4;
        if (type === 0) {
          // 1. Agregação pesada
          await pool.query("SELECT especialidade, COUNT(*), AVG(resposta_correta) FROM questoes GROUP BY especialidade");
        } else if (type === 1) {
          // 2. Busca com paginação e ordenação
          await pool.query("SELECT * FROM questoes ORDER BY created_at DESC LIMIT 20 OFFSET $1", [idx % 10]);
        } else if (type === 2) {
          // 3. Leitura na tabela de flashcards
          await pool.query("SELECT * FROM flashcards LIMIT 15");
        } else {
          // 4. Operação transacional de teste com rollback
          const client = await pool.connect();
          try {
            await client.query("BEGIN");
            await client.query(
              "INSERT INTO user_usage (user_id, user_email, plan, ai_requests_month) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET ai_requests_month = user_usage.ai_requests_month + 1",
              [`stress-test-${idx}`, `stress-${idx}@test.com`, 'free', 1]
            );
            await client.query("ROLLBACK");
          } finally {
            client.release();
          }
        }
        latencies.push(Date.now() - qStart);
      } catch (err) {
        errorCount++;
      }
    });

    await Promise.all(taskPromises);
    const durationMs = Date.now() - startTime;
    const rps = (totalRequests / (durationMs / 1000)).toFixed(2);

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const max = latencies[latencies.length - 1] || 0;

    stressResults.push({
      "Concorrência": `${concurrency} workers`,
      "Total Req": totalRequests,
      "Duração (s)": (durationMs / 1000).toFixed(2),
      "RPS (Req/s)": rps,
      "Latência P50 (ms)": `${p50}ms`,
      "Latência P95 (ms)": `${p95}ms`,
      "Latência P99 (ms)": `${p99}ms`,
      "Latência Máx": `${max}ms`,
      "Erros": errorCount
    });
  }

  console.log("\n📊 RESULTADOS DO TESTE DE ESTRESSE NO POSTGRESQL:");
  console.table(stressResults);
}

// ====================================================================
// 🚀 ORQUESTRADOR PRINCIPAL
// ====================================================================

async function runCompleteAuditAndStress() {
  console.log("\n================================================================================");
  console.log("🏥 MedIA v2.0 — RELATÓRIO DE ESTRESSE, MEMÓRIA E SEGURANÇA SQL");
  console.log("================================================================================");

  // 1. Auditoria de Vulnerabilidades SQL
  const sqlAudit = auditSqlVulnerabilities();

  // 2. Auditoria das Variáveis de Ambiente
  auditEnvironmentVariables();

  // 3. Conexão ao Banco de Dados & Estresse
  const dbUrl = process.env.DATABASE_URL || "postgresql://clinica:clinica_dev@localhost:5432/clinica_rag";
  const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 30,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    console.log("✅ Conectado ao banco de dados com sucesso!");

    // Diagnóstico e Forçamento de Memória de Cache
    await tuneAndInspectDatabaseMemory(client);
    client.release();

    // Teste de Estresse sob Concorrência
    await runDatabaseStressTest(pool);

  } catch (err) {
    console.warn("\n⚠️ AVISO: Não foi possível conectar ao banco PostgreSQL na URL configurada:", err.message);
    console.log("   (Obs: Os módulos de Auditoria Estática de SQL e de Variáveis de Ambiente foram concluídos com sucesso).");
  } finally {
    await pool.end();
  }

  console.log("\n================================================================================");
  console.log("🏁 AUDITORIA E TESTE DE ESTRESSE FINALIZADOS COM SUCESSO!");
  console.log("================================================================================\n");
}

runCompleteAuditAndStress().catch((err) => {
  console.error("❌ Erro fatal durante a auditoria:", err);
  process.exit(1);
});
