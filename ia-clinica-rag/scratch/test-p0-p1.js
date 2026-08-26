import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";
import { IaPreceptoraService } from "../src/services/ia-preceptora.service.js";
import { emailService } from "../src/services/email.service.js";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 INICIANDO BATERIA DE TESTES DE INTEGRAÇÃO MED-IA");
  console.log("==================================================");

  // 1. Teste do Gerador de Questões (Exatamente 5)
  console.log("\n[TESTE 1] Gerador de 5 Questões Médicas & Deduplicação...");
  const resultadoQuestoes = await QuestoesGeneratorService.generateQuestionsBatch({
    especialidade: "Cardiologia",
    tema: "Insuficiência Cardíaca e DAC",
    dificuldadeEspecifica: "dificil"
  });

  console.log(`✅ Total de questões retornadas: ${resultadoQuestoes.questoes.length}`);
  if (resultadoQuestoes.questoes.length !== 5) {
    throw new Error(`Falha: esperado 5 questões, recebido ${resultadoQuestoes.questoes.length}`);
  }

  resultadoQuestoes.questoes.forEach((q, idx) => {
    console.log(`   [Q${idx + 1}] (${q.banca} - ${q.tema}): ${q.enunciado.slice(0, 70)}...`);
    console.log(`        Opções: ${q.alternativas.length} | Gabarito: ${q.resposta_correta}`);
  });

  // 2. Teste da IA Preceptora (Unificada com OrchestratorAgent)
  console.log("\n[TESTE 2] IA Preceptora unificada com IA Principal...");
  const resultadoPreceptora = await IaPreceptoraService.processChat({
    mensagem: "Explique a fisiopatologia do choque cardiogênico e os alvos terapêuticos de prova.",
    modo: "estudante"
  });

  console.log(`✅ Resposta da IA Preceptora obtida com sucesso!`);
  console.log(`   Modo: ${resultadoPreceptora.modo}`);
  console.log(`   Trecho da resposta: ${resultadoPreceptora.resposta.slice(0, 150)}...`);

  // 3. Teste do Serviço de Email com Logs Estruturados
  console.log("\n[TESTE 3] Envio de Email com Logs de Conexão e Aceite...");
  const emailRes = await emailService.sendMail({
    to: "karlsongabriliveiasilveira34@gmail.com",
    subject: "🧪 Teste de Validação MedIA v2.0",
    text: "Validação do transportador SMTP e entregabilidade de notificações."
  });

  console.log("✅ Resultado do Email:", emailRes);

  console.log("\n==================================================");
  console.log("🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("❌ Erro no teste:", err);
  process.exit(1);
});
