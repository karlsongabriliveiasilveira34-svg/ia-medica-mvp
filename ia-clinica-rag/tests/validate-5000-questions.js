/**
 * ====================================================================
 * 🧪 SUÍTE DE AUDITORIA E VALIDAÇÃO: 5.000+ QUESTÕES MedMCQA
 * ====================================================================
 * 
 * Verificações Mandatórias:
 * 1. Quantidade total de questões no acervo >= 5000
 * 2. Quantidade de questões MedMCQA >= 5000
 * 3. Questões duplicadas por sourceId: 0
 * 4. Questões sem 4 alternativas: 0
 * 5. Questões sem resposta correta válida (0 a 3): 0
 * 6. Amostras reais com integridade de pergunta, opções, gabarito e explicação
 * 7. Paginação e filtros no endpoint /api/questoes
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDMCQA_DATASET_FILE = path.resolve(__dirname, "../src/database/medmcqa-dataset.json");

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, testId, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`✅ [PASS] ${testId}: ${message}`);
  } else {
    failCount++;
    console.error(`❌ [FAIL] ${testId}: ${message}`);
  }
}

async function runValidation() {
  console.log("=".repeat(80));
  console.log("🩺 AUDITORIA DE INTEGRIDADE: ACERVO MASSIVO DE 5.000+ QUESTÕES (MedMCQA)");
  console.log("=".repeat(80) + "\n");

  // 1. CARREGAR DATASET LOCAL PERSISTIDO
  const rawData = fs.readFileSync(MEDMCQA_DATASET_FILE, "utf8");
  const dataset = JSON.parse(rawData);

  console.log("--------------------------------------------------------------------------------");
  console.log("📌 BATERIA 1: CONTAGEM E DEDUPLICAÇÃO NO DATASET MedMCQA");
  console.log("--------------------------------------------------------------------------------");

  assert(dataset.length >= 5000, "MEDMCQA-1.1", `Total no dataset MedMCQA >= 5.000 (Atual: ${dataset.length} questões)`);

  const sourceIdMap = new Map();
  let dupSourceIds = 0;
  let invalidOptions = 0;
  let invalidAnswers = 0;
  let missingExplanations = 0;

  for (const q of dataset) {
    if (q.sourceId) {
      if (sourceIdMap.has(q.sourceId)) {
        dupSourceIds++;
      } else {
        sourceIdMap.set(q.sourceId, true);
      }
    }

    if (!Array.isArray(q.options) || q.options.length < 4) {
      invalidOptions++;
    }

    if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
      invalidAnswers++;
    }

    if (!q.explanation || q.explanation.trim().length === 0) {
      missingExplanations++;
    }
  }

  assert(dupSourceIds === 0, "MEDMCQA-1.2", `Zero duplicatas por sourceId no dataset (Duplicatas: ${dupSourceIds})`);
  assert(invalidOptions === 0, "MEDMCQA-1.3", `Zero questões sem 4 alternativas completas (Inválidas: ${invalidOptions})`);
  assert(invalidAnswers === 0, "MEDMCQA-1.4", `Zero questões sem resposta correta válida (0-3) (Inválidas: ${invalidAnswers})`);
  assert(missingExplanations === 0, "MEDMCQA-1.5", `100% das questões possuem explicação / fundamentação clínica`);

  console.log("\n--------------------------------------------------------------------------------");
  console.log("📌 BATERIA 2: ESTATÍSTICAS GLOBAIS DO ENGINE MedIA");
  console.log("--------------------------------------------------------------------------------");

  const stats = await QuestoesGeneratorService.getStudyStats();
  assert(stats.totalQuestions >= 5000, "STATS-2.1", `Total global de questões no MedIA >= 5.000 (Total Real: ${stats.totalQuestions})`);
  assert(stats.totalFlashcards >= 4700, "STATS-2.2", `Total de flashcards mantido >= 4.700 (Total Real: ${stats.totalFlashcards})`);
  assert(Object.keys(stats.porEspecialidade).length >= 10, "STATS-2.3", `Cobertura de especialidades médicas ampla (Total áreas: ${Object.keys(stats.porEspecialidade).length})`);

  console.log("\n--------------------------------------------------------------------------------");
  console.log("📌 BATERIA 3: PAGINAÇÃO E FILTROS NA API");
  console.log("--------------------------------------------------------------------------------");

  // Teste Página 1 com limit 20
  const page1 = await QuestoesGeneratorService.listQuestions({ page: 1, limit: 20 });
  assert(page1.questoes.length === 20, "PAGINATE-3.1", `Página 1 respeita limit=20 (Retornados: ${page1.questoes.length})`);
  assert(page1.total >= 5000, "PAGINATE-3.2", `Total de questões reflete o acervo completo (Total: ${page1.total})`);
  assert(page1.totalPages >= 250, "PAGINATE-3.3", `Total de páginas calculado com precisão (TotalPages: ${page1.totalPages})`);
  assert(page1.hasNext === true, "PAGINATE-3.4", `Indicador hasNext=true na página 1`);

  // Teste Página 2 com limit 20
  const page2 = await QuestoesGeneratorService.listQuestions({ page: 2, limit: 20 });
  assert(page2.questoes.length === 20, "PAGINATE-3.5", `Página 2 respeita limit=20 (Retornados: ${page2.questoes.length})`);
  assert(page2.questoes[0].id !== page1.questoes[0].id, "PAGINATE-3.6", `Itens da Página 2 diferem da Página 1`);

  // Teste Página com limit 50
  const pageLimit50 = await QuestoesGeneratorService.listQuestions({ page: 1, limit: 50 });
  assert(pageLimit50.questoes.length === 50, "PAGINATE-3.7", `Página com limit=50 retorna 50 questões`);

  // Teste Filtro por Especialidade
  const clinicaFiltered = await QuestoesGeneratorService.listQuestions({ especialidade: "Clínica Médica", limit: 10 });
  assert(clinicaFiltered.total > 0, "FILTER-3.8", `Filtro por Clínica Médica retorna acervo dedicado (Total: ${clinicaFiltered.total})`);

  console.log("\n--------------------------------------------------------------------------------");
  console.log("📌 BATERIA 4: INSPEÇÃO DE AMOSTRAS REAIS DO MedMCQA");
  console.log("--------------------------------------------------------------------------------");

  const sample1 = dataset[0];
  const sample2 = dataset[Math.floor(dataset.length / 2)];
  const sample3 = dataset[dataset.length - 1];

  console.log(`[Amostra 1] ID: ${sample1.id} | Área: ${sample1.subject}`);
  console.log(`- Pergunta: "${sample1.question.slice(0, 80)}..."`);
  console.log(`- 4 Alternativas: [A] ${sample1.options[0].slice(0, 25)} | [B] ${sample1.options[1].slice(0, 25)} | [C] ${sample1.options[2].slice(0, 25)} | [D] ${sample1.options[3].slice(0, 25)}`);
  console.log(`- Gabarito: Alternativa ${String.fromCharCode(65 + sample1.correctAnswer)}`);
  console.log(`- Explicação: "${sample1.explanation.slice(0, 80)}..."\n`);

  assert(Boolean(sample1.question && sample1.options.length === 4), "SAMPLE-4.1", "Amostra 1 íntegra");
  assert(Boolean(sample2.question && sample2.options.length === 4), "SAMPLE-4.2", "Amostra 2 íntegra");
  assert(Boolean(sample3.question && sample3.options.length === 4), "SAMPLE-4.3", "Amostra 3 íntegra");

  console.log("\n" + "=".repeat(80));
  console.log("📊 RESULTADO DA AUDITORIA DO ACERVO DE 5.000+ QUESTÕES");
  console.log("=".repeat(80));
  console.log(`Total de Testes Executados: ${testCount}`);
  console.log(`Testes Aprovados: ${passCount}`);
  console.log(`Testes com Falha: ${failCount}`);
  console.log(`Taxa de Sucesso: ${((passCount / testCount) * 100).toFixed(1)}%`);

  if (failCount === 0) {
    console.log("\n🎉 TODAS AS VALIDAÇÕES DE 5.000+ QUESTÕES MedMCQA FORAM APROVADAS COM 100% DE SUCESSO!");
  }

  return { testCount, passCount, failCount };
}

runValidation().catch(console.error);
