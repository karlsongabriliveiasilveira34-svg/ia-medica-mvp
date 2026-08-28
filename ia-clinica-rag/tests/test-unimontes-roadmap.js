/**
 * Bateria de Testes Automatizados: ROADMAP MEDICINA UNIMONTES (12 PERÍODOS)
 */
import assert from "node:assert";
import { UnimontesRoadmapService, UNIMONTES_PERIODOS } from "../src/services/unimontes-roadmap.service.js";

console.log("=".repeat(80));
console.log("🎓 AUDITORIA DO ROADMAP COMPLETO MEDICINA UNIMONTES (12 PERÍODOS)");
console.log("=".repeat(80));

// 1. Validar 12 períodos completos
console.log("\n📌 BATERIA 1: MATRIZ CURRICULAR DE 12 PERÍODOS");
const periodos = UnimontesRoadmapService.listPeriodos();
console.log(`Total de Períodos: ${periodos.length}`);
assert.strictEqual(periodos.length, 12, "Deve conter exatamente 12 períodos de medicina");
console.log("✅ [PASS] 1.1: 12 Períodos cadastrados com sucesso.");

// 2. Validar 1º Período com 4 módulos fundamentais
const p1 = UnimontesRoadmapService.getPeriodo(1);
assert.ok(p1, "1º Período deve existir");
assert.strictEqual(p1.modulos.length, 4, "1º Período deve ter 4 módulos (Humanidades, Anatomia, Embriologia, Metabolismo)");
assert.ok(p1.livros.length >= 4, "1º Período deve ter livros OER");
console.log("✅ [PASS] 1.2: 1º Período estruturado com Humanidades, Anatomia, Embrio e Metabolismo.");

// 3. Validar Internato (11º e 12º Períodos)
const p11 = UnimontesRoadmapService.getPeriodo(11);
const p12 = UnimontesRoadmapService.getPeriodo(12);
assert.strictEqual(p11.cargaHoraria, 1000, "11º Período deve ser de internato (1000h)");
assert.strictEqual(p12.cargaHoraria, 1000, "12º Período deve ser de internato (1000h)");
console.log("✅ [PASS] 1.3: Internato Médico (11º e 12º períodos) estruturado.");

// 4. Validar Quizzes e Casos Clínicos
console.log("\n📌 BATERIA 2: CASOS CLÍNICOS E QUIZZES POR PERÍODO");
const quizP1 = UnimontesRoadmapService.getPeriodoQuiz(1);
assert.strictEqual(quizP1.length, 4, "1º Período deve ter 4 questões de quiz correspondentes aos 4 módulos");
console.log("✅ [PASS] 2.1: Quizzes gerados com sucesso.");

console.log("\n" + "=".repeat(80));
console.log("🎉 TODAS AS VALIDAÇÕES DO ROADMAP UNIMONTES FORAM APROVADAS!");
console.log("=".repeat(80));
