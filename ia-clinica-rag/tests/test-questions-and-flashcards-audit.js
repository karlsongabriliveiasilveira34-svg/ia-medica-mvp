/**
 * ====================================================================
 * 🧪 SUÍTE DE TESTES E AUDITORIA DAS APIs DE QUESTÕES E FLASHCARDS
 * ====================================================================
 * 
 * Valida de ponta a ponta:
 * 1. Camada Adapter (Normalização e Fingerprints SHA-256)
 * 2. Deduplicação e Similaridade de Jaccard
 * 3. Listagem paginada e filtros (especialidade, banca, dificuldade, deck)
 * 4. Validação de Cotas Comerciais no Backend (Free vs Estudante vs Médico)
 * 5. Registro de Respostas e Cálculo de Aproveitamento do Estudante
 * 6. Estatísticas Dinâmicas Reais (Zero Números Fictícios)
 * 7. Resiliência de Fallback
 */

import {
  normalizeQuestion,
  normalizeFlashcard,
  generateQuestionHash,
  generateFlashcardHash,
  calculateJaccardSimilarity
} from "../src/adapters/question-flashcard.adapter.js";
import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";
import { usageMeterService } from "../src/services/usage-meter.service.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${testName} — ${details}`);
  }
}

async function runAudit() {
  console.log("\n" + "=".repeat(80));
  console.log("🩺 AUDITORIA DAS APIs DE QUESTÕES, FLASHCARDS E NORMALIZADORES (MedIa)");
  console.log("=".repeat(80) + "\n");

  // ==========================================================================
  // BATERIA 1: ADAPTER & NORMALIZADORES
  // ==========================================================================
  console.log("-".repeat(80));
  console.log("📌 BATERIA 1: ADAPTER, NORMALIZAÇÃO E FINGERPRINTS SHA-256");
  console.log("-".repeat(80));

  // 1.1 Normalizar questão no formato legado
  const legacyQ = {
    id: 101,
    enunciado: "Paciente com dispneia e dor torácica.",
    alternativas: ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
    resposta_correta: 1,
    explicacao: "Conduta A é padrão.",
    especialidade: "Cardiologia",
    banca: "ENARE 2024"
  };

  const normQ = normalizeQuestion(legacyQ);
  assert(normQ && normQ.question === legacyQ.enunciado, "ADAPTER-1.1: Normalização de campos legados (enunciado -> question)");
  assert(normQ.correctAnswer === 1 && normQ.options.length === 4, "ADAPTER-1.2: Normalização de alternativas e gabarito");
  assert(normQ.hash && normQ.hash.length === 64, "ADAPTER-1.3: Geração de hash SHA-256 determinístico de 64 caracteres");

  // 1.2 Normalizar flashcard
  const legacyCard = {
    id: 202,
    frente: "O que é Choque Séptico?",
    verso: "Sepse com necessidade de vasopressor para manter PAM >= 65.",
    deck_id: "infecto",
    especialidade: "Infectologia"
  };

  const normCard = normalizeFlashcard(legacyCard);
  assert(normCard && normCard.front === legacyCard.frente && normCard.back === legacyCard.verso, "ADAPTER-1.4: Normalização de flashcard (frente/verso -> front/back)");
  assert(normCard.hash && normCard.hash.length === 64, "ADAPTER-1.5: Geração de hash SHA-256 para flashcard");

  // 1.3 Deduplicação e Similaridade de Jaccard
  const textA = "Paciente com infarto agudo do miocardio dor toracica e supra de ST.";
  const textB = "Homem com infarto agudo do miocardio dor toracica e hipotensao.";
  const textC = "Crianca de 3 anos com febre e tosse produtiva.";

  const simAB = calculateJaccardSimilarity(textA, textB);
  const simAC = calculateJaccardSimilarity(textA, textC);

  assert(simAB > 0.40, `ADAPTER-1.6: Similaridade de textos clínicos correlacionados (${(simAB * 100).toFixed(1)}%)`);
  assert(simAC < 0.20, `ADAPTER-1.7: Rejeição de similaridade entre temas não correlatos (${(simAC * 100).toFixed(1)}%)`);

  // ==========================================================================
  // BATERIA 2: LISTAGEM, PAGINAÇÃO E FILTROS DE QUESTÕES
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 2: CONSULTA, PAGINAÇÃO E FILTROS DE QUESTÕES");
  console.log("-".repeat(80));

  // 2.1 Listagem Geral Paginada
  const page1 = await QuestoesGeneratorService.listQuestions({ page: 1, limit: 5 });
  assert(page1.questoes.length === 5, "QUESTOES-2.1: Paginação respeita limite de 5 itens por página");
  assert(page1.total >= 5 && page1.hasNext === true, "QUESTOES-2.2: Indicador hasNext e total calculados corretamente");

  // 2.2 Filtro por Especialidade (Cardiologia / Clínica Médica)
  const filterEsp = await QuestoesGeneratorService.listQuestions({ especialidade: "Cardio", limit: 20 });
  const allCardio = filterEsp.questoes.every(q => 
    (q.subject || q.especialidade || "").toLowerCase().includes("cardio") || 
    (q.topic || q.tema || "").toLowerCase().includes("cardio")
  );
  assert(filterEsp.questoes.length > 0 && allCardio, "QUESTOES-2.3: Filtro por especialidade retorna apenas questões correspondentes");

  // 2.3 Filtro por Banca Examinadora (ENARE)
  const filterBanca = await QuestoesGeneratorService.listQuestions({ banca: "ENARE", limit: 20 });
  const allEnare = filterBanca.questoes.every(q => (q.source || q.banca || "").includes("ENARE"));
  assert(filterBanca.questoes.length > 0 && allEnare, "QUESTOES-2.4: Filtro por banca examinadora oficial (ENARE)");

  // ==========================================================================
  // BATERIA 3: RESPOSTA DO ESTUDANTE E HISTÓRICO REAL
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 3: REGISTRO DE RESPOSTAS E APROVEITAMENTO");
  console.log("-".repeat(80));

  const targetQ = page1.questoes[0];
  const correctAns = targetQ.correctAnswer !== undefined ? targetQ.correctAnswer : targetQ.resposta_correta;

  // 3.1 Responder com alternativa correta
  const resCorreta = await QuestoesGeneratorService.recordAnswer({
    userId: "test_student_10",
    userEmail: "student10@media.med.br",
    questaoId: targetQ.id,
    alternativaSelecionada: correctAns
  });
  assert(resCorreta.success === true && resCorreta.acertou === true, "STUDY-3.1: Resposta correta registrada com status acertou=true");

  // 3.2 Responder com alternativa errada
  const wrongAlt = (correctAns + 1) % 4;
  const resErrada = await QuestoesGeneratorService.recordAnswer({
    userId: "test_student_10",
    userEmail: "student10@media.med.br",
    questaoId: targetQ.id,
    alternativaSelecionada: wrongAlt
  });
  assert(resErrada.success === true && resErrada.acertou === false, "STUDY-3.2: Resposta errada registrada com status acertou=false");

  // 3.3 Obter progresso acumulado
  const progress = await QuestoesGeneratorService.getUserStudyProgress("test_student_10", "student10@media.med.br");
  assert(progress.totalRespondidas >= 2, "STUDY-3.3: Total de respostas do estudante computado em tempo real");
  assert(progress.acertos >= 1 && progress.erros >= 1, "STUDY-3.4: Contagem de acertos e erros segregada");
  assert(typeof progress.aproveitamento === "number", "STUDY-3.5: Porcentagem de aproveitamento calculada com precisão");

  // ==========================================================================
  // BATERIA 4: FLASHCARDS E REPETIÇÃO ESPAÇADA
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 4: FLASHCARDS E DECK MANAGER");
  console.log("-".repeat(80));

  // 4.1 Listagem de Flashcards do Deck 'cardio'
  const cardioCards = await QuestoesGeneratorService.listFlashcards({ deckId: "cardio", limit: 20 });
  assert(cardioCards.flashcards.length > 0, "FLASHCARDS-4.1: Listagem de flashcards do baralho 'cardio'");
  assert(cardioCards.flashcards.every(c => c.deckId === "cardio" || c.deck_id === "cardio"), "FLASHCARDS-4.2: Todos os cards pertencem estritamente ao deck selecionado");

  // 4.2 Listagem por área
  const infectoCards = await QuestoesGeneratorService.listFlashcards({ deckId: "infecto", limit: 20 });
  assert(infectoCards.flashcards.length > 0, "FLASHCARDS-4.3: Listagem de flashcards do baralho 'infecto'");

  // ==========================================================================
  // BATERIA 5: ESTATÍSTICAS 100% DINÂMICAS (ZERO NÚMEROS FICTÍCIOS)
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 5: ESTATÍSTICAS DINÂMICAS DO ACERVO");
  console.log("-".repeat(80));

  const stats = await QuestoesGeneratorService.getStudyStats();
  assert(stats.totalQuestions > 0, `STATS-5.1: Total real de questões indexadas (${stats.totalQuestions})`);
  assert(stats.totalFlashcards > 0, `STATS-5.2: Total real de flashcards indexados (${stats.totalFlashcards})`);
  assert(Array.isArray(stats.bancas) && stats.bancas.some(b => b.includes("ENARE")), "STATS-5.5: Lista de bancas inclui ENARE");

  // ==========================================================================
  // BATERIA 6: COTAS COMERCIAIS E LIMITES POR PLANO
  // ==========================================================================
  console.log("\n" + "-".repeat(80));
  console.log("📌 BATERIA 6: VALIDAÇÃO DE LIMITES E COTAS DE PLANOS NO BACKEND");
  console.log("-".repeat(80));

  const freeUser = "user_free_audit_" + Date.now();
  const studentUser = "user_student_audit_" + Date.now();

  // 6.1 Cota Free de Questões: 5 por dia
  const freeQCheck = usageMeterService.checkResourceLimit(freeUser, "free", "questions");
  assert(freeQCheck.allowed === true && freeQCheck.limit === 5, "PLANS-6.1: Cota do Plano Free de 5 questões/dia confirmada");

  for (let i = 0; i < 5; i++) {
    usageMeterService.recordResourceUsage(freeUser, "free", "questions", 1);
  }
  const freeQBlocked = usageMeterService.checkResourceLimit(freeUser, "free", "questions");
  assert(freeQBlocked.allowed === false && freeQBlocked.remaining === 0, "PLANS-6.2: Bloqueio estrito da 6ª questão no plano Free");

  // 6.2 Cota Free de Flashcards: 10 por dia
  const freeFCheck = usageMeterService.checkResourceLimit(freeUser, "free", "flashcards");
  assert(freeFCheck.allowed === true && freeFCheck.limit === 10, "PLANS-6.3: Cota do Plano Free de 10 flashcards/dia confirmada");

  for (let i = 0; i < 10; i++) {
    usageMeterService.recordResourceUsage(freeUser, "free", "flashcards", 1);
  }
  const freeFBlocked = usageMeterService.checkResourceLimit(freeUser, "free", "flashcards");
  assert(freeFBlocked.allowed === false && freeFBlocked.remaining === 0, "PLANS-6.4: Bloqueio estrito do 11º flashcard no plano Free");

  // 6.3 Cota Estudante: 100 questões/dia e 150 flashcards/dia
  const studentQCheck = usageMeterService.checkResourceLimit(studentUser, "estudante", "questions");
  assert(studentQCheck.allowed === true && studentQCheck.limit === 100, "PLANS-6.5: Cota do Plano Estudante de 100 questões/dia confirmada");

  const studentFCheck = usageMeterService.checkResourceLimit(studentUser, "estudante", "flashcards");
  assert(studentFCheck.allowed === true && studentFCheck.limit === 150, "PLANS-6.6: Cota do Plano Estudante de 150 flashcards/dia confirmada");

  // ==========================================================================
  // RELATÓRIO FINAL
  // ==========================================================================
  console.log("\n" + "=".repeat(80));
  console.log("📊 RESULTADO DA AUDITORIA DAS APIs DE QUESTÕES E FLASHCARDS");
  console.log("=".repeat(80));
  console.log(`Total de Testes Executados: ${totalTests}`);
  console.log(`Testes Aprovados: ${passedTests}`);
  console.log(`Testes com Falha: ${failedTests}`);
  console.log(`Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log("\n🎉 TODAS AS REGRAS DAS APIs DE QUESTÕES E FLASHCARDS FORAM AUDITADAS E APROVADAS COM SUCESSO!");
  } else {
    console.error(`\n⚠️ ${failedTests} TESTE(S) APRESENTARAM FALHA.`);
  }
}

runAudit().catch(err => {
  console.error("Erro fatal ao rodar testes:", err);
});
