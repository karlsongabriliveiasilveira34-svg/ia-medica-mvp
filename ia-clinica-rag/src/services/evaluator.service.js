import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { OrchestratorAgent } from "../agents/orchestrator.agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runBenchmarkEvaluation() {
  console.log("🧪 Iniciando Avaliação Automática da Plataforma de Apoio à Decisão Clínica (Benchmark Suite)...");
  
  const benchmarkPath = path.join(process.cwd(), "tests", "benchmark", "cases.json");
  const casesData = JSON.parse(await fs.readFile(benchmarkPath, "utf-8"));

  let passedCases = 0;
  const results = [];

  for (const caseObj of casesData) {
    console.log(`\n📋 Avaliando Caso: [${caseObj.id}] ${caseObj.question.substring(0, 60)}...`);
    const startTime = Date.now();

    const response = await OrchestratorAgent.processQuery({
      question: caseObj.question,
      specialty: caseObj.specialty,
      topK: 5
    });

    const latencyMs = Date.now() - startTime;
    const answerText = response.answer || "";

    // 1. Verificar presença de elementos esperados
    const matchedElements = caseObj.expectedElements.filter(el => 
      answerText.toLowerCase().includes(el.toLowerCase())
    );

    // 2. Verificar ausência de afirmações proibidas (anti-alucinação)
    const forbiddenMatches = caseObj.forbiddenClaims.filter(claim => 
      answerText.toLowerCase().includes(claim.toLowerCase())
    );

    const isFactualPassed = matchedElements.length >= Math.ceil(caseObj.expectedElements.length * 0.5);
    const isAntiHallucinationPassed = forbiddenMatches.length === 0;
    const isCasePassed = isFactualPassed && isAntiHallucinationPassed;

    if (isCasePassed) passedCases++;

    results.push({
      caseId: caseObj.id,
      specialty: caseObj.specialty,
      latencyMs,
      confidenceScore: response.confidence?.score || 0,
      evidenceLevel: response.evidence?.level || "Moderada",
      isFactualPassed,
      isAntiHallucinationPassed,
      isCasePassed,
      matchedElements,
      forbiddenMatches
    });
  }

  const accuracy = Number(((passedCases / casesData.length) * 100).toFixed(1));
  console.log(`\n================ RESULTADO FINAL DO BENCHMARK ================`);
  console.log(`✅ Casos Aprovados: ${passedCases} / ${casesData.length}`);
  console.log(`📊 Taxa de Desempenho no Benchmark: ${accuracy}%`);

  return {
    accuracy,
    totalCases: casesData.length,
    passedCases,
    results
  };
}

if (process.argv[1].endsWith("evaluator.service.js")) {
  runBenchmarkEvaluation().then(() => process.exit(0));
}
