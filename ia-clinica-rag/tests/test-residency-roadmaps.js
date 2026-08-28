import assert from "assert";
import { EspecializacaoRoadmapService, ESPECIALIDADES_DATABASE } from "../src/services/especializacao-roadmap.service.js";
import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";

console.log("================================================================================");
console.log("🩺 AUDITORIA DO ROADMAP DE ESPECIALIZAÇÃO & RESIDÊNCIA MÉDICA");
console.log("================================================================================");

// BATERIA 1: Especialidades e Fases Curriculares
console.log("\n📌 BATERIA 1: ESTRUTURA CURRICULAR DAS ESPECIALIDADES");
const especialidades = EspecializacaoRoadmapService.listEspecialidades();
console.log(`Total de Especialidades Cadastradas: ${especialidades.length}`);
assert(especialidades.length >= 5, "Deve haver pelo menos 5 especialidades cadastradas");
console.log("✅ [PASS] ROADMAP-1.1: Mínimo de 5 grandes áreas da residência cadastradas");

const cardio = EspecializacaoRoadmapService.getRoadmap("cardio");
assert(cardio !== null, "Cardiologia deve possuir roadmap completo");
assert(cardio.fases.length === 4, "Cardiologia deve possuir 4 fases estruturadas");
console.log("✅ [PASS] ROADMAP-1.2: Cardiologia possui 4 fases estruturadas (Fundamentação, Aprofundamento, Especialização, Consolidação)");

const cirurgia = EspecializacaoRoadmapService.getRoadmap("cirurgia");
assert(cirurgia !== null, "Cirurgia Geral deve possuir roadmap");
assert(cirurgia.fases.length === 4, "Cirurgia Geral deve possuir 4 fases");
console.log("✅ [PASS] ROADMAP-1.3: Cirurgia Geral possui 4 fases estruturadas");

// BATERIA 2: Flashcards por Especialidade
console.log("\n📌 BATERIA 2: VINCULAÇÃO E DENSIDADE DE FLASHCARDS POR ESPECIALIDADE");
const stats = await QuestoesGeneratorService.getStudyStats();
console.log("Total de Flashcards no Acervo Real:", stats.totalFlashcards);
assert(stats.totalFlashcards >= 5000, "Deve haver mais de 5.000 flashcards indexados");
console.log("✅ [PASS] FLASHCARDS-2.1: Acervo massivo >= 5.000 flashcards confirmado");

console.log("Distribuição real por deck:", stats.porDeck);
assert(stats.porDeck["cirurgia"] >= 500, "Cirurgia deve ter mais de 500 cards");
assert(stats.porDeck["clinica"] >= 2000, "Clínica deve ter mais de 2.000 cards");
assert(stats.porDeck["infecto"] >= 300, "Infecto deve ter mais de 300 cards");
assert(stats.porDeck["pediatria"] >= 200, "Pediatria deve ter mais de 200 cards");
assert(stats.porDeck["go"] >= 200, "GO deve ter mais de 200 cards");
assert(stats.porDeck["preventiva"] >= 200, "Preventiva deve ter mais de 200 cards");
assert(stats.porDeck["cardio"] >= 100, "Cardio deve ter mais de 100 cards");
console.log("✅ [PASS] FLASHCARDS-2.2: Todas as grandes áreas possuem centenas de flashcards especializados");

// BATERIA 3: Início de Especialização e Progresso
console.log("\n📌 BATERIA 3: CICLO DE VIDA DE ESPECIALIZAÇÃO DO ESTUDANTE");
const inicio = await EspecializacaoRoadmapService.iniciarEspecializacao({
  usuarioId: "user_test_residencia",
  especialidadeId: "cardio"
});
assert(inicio.status === "em_progresso", "Status deve ser 'em_progresso'");
assert(inicio.faseAtual === 1, "Deve iniciar na Fase 1");
console.log("✅ [PASS] LIFECYCLE-3.1: Início de especialização registrado com sucesso");

const progresso = await EspecializacaoRoadmapService.getProgresso({
  usuarioId: "user_test_residencia",
  especialidadeId: "cardio"
});
assert(progresso.status === "em_progresso", "Progresso recuperado com sucesso");
console.log("✅ [PASS] LIFECYCLE-3.2: Consulta de progresso do estudante validada");

console.log("\n================================================================================");
console.log("🎉 TODAS AS VALIDAÇÕES DO ROADMAP DE RESIDÊNCIA E FLASHCARDS FORAM APROVADAS!");
console.log("================================================================================\n");
