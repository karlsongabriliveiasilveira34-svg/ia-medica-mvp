import { AuthSecurityService } from "../src/services/auth-security.service.js";
import { QuestoesGeneratorService } from "../src/services/questoes-generator.service.js";
import crypto from "crypto";

async function runQuestionsAndPlansTest() {
  console.log("==================================================");
  console.log("🧪 TESTANDO BANCO DE QUESTÕES REAL E ARQUITETURA DE PLANOS FREE");
  console.log("==================================================");

  // ----------------------------------------------------
  // TESTE 1: Novo cadastro como Estudante -> PLANO FREE
  // ----------------------------------------------------
  console.log("\n[TESTE 1] Registrando novo usuário escolhendo perfil 'Estudante'...");
  const passA = "A!" + crypto.randomBytes(12).toString("hex") + "9";
  const userA = await AuthSecurityService.registerUser({
    name: "Lucas Estudante",
    email: "lucas.estudante.test@gmail.com",
    password: passA,
    plan: "estudante" // Formulário selecionou Estudante
  });

  console.log("   Resultado cadastro Usuário A:", {
    id: userA.id,
    email: userA.email,
    plan: userA.plan,
    app_mode: userA.app_mode
  });

  if (userA.plan !== "free") {
    throw new Error(`FALHA CRÍTICA: Usuário criado com plano '${userA.plan}' em vez de 'free'!`);
  }
  if (userA.app_mode !== "estudante") {
    throw new Error(`FALHA: app_mode deveria ser 'estudante', obteve '${userA.app_mode}'!`);
  }
  console.log("   ✅ REGRA VALIDADA: Novo usuário iniciou estritamente com plano = 'free'!");

  // ----------------------------------------------------
  // TESTE 2: Novo cadastro como Médico -> PLANO FREE
  // ----------------------------------------------------
  console.log("\n[TESTE 2] Registrando novo usuário escolhendo perfil 'Médico'...");
  const passB = "B!" + crypto.randomBytes(12).toString("hex") + "8";
  const userB = await AuthSecurityService.registerUser({
    name: "Dr. Marcos Clínico",
    email: "marcos.medico.test@gmail.com",
    password: passB,
    crm: "112233-SP",
    plan: "medico" // Formulário selecionou Médico
  });

  console.log("   Resultado cadastro Usuário B:", {
    id: userB.id,
    email: userB.email,
    plan: userB.plan,
    app_mode: userB.app_mode
  });

  if (userB.plan !== "free") {
    throw new Error(`FALHA CRÍTICA: Médico criado com plano '${userB.plan}' em vez de 'free'!`);
  }
  if (userB.app_mode !== "medico") {
    throw new Error(`FALHA: app_mode deveria ser 'medico', obteve '${userB.app_mode}'!`);
  }
  console.log("   ✅ REGRA VALIDADA: Médico também iniciou estritamente com plano = 'free'!");

  // ----------------------------------------------------
  // TESTE 3: Confirmação de Email e Emissão de Sessão FREE
  // ----------------------------------------------------
  console.log("\n[TESTE 3] Confirmando email do Usuário A e verificando sessão gerada...");
  const verifyResultA = await AuthSecurityService.verifyEmailToken(userA.verificationToken);
  console.log("   Sessão gerada:", {
    email: verifyResultA.user.email,
    plan: verifyResultA.user.plan,
    app_mode: verifyResultA.user.app_mode
  });

  if (verifyResultA.user.plan !== "free") {
    throw new Error("Sessão após verificação de email não contém plan = 'free'!");
  }
  console.log("   ✅ Sessão confirmada com plan = 'free'!");

  // ----------------------------------------------------
  // TESTE 4: Banco Real de Questões (Listagem, Filtros, Paginação)
  // ----------------------------------------------------
  console.log("\n[TESTE 4] Consultando acervo de questões da API com paginação e filtros...");
  const listPage1 = await QuestoesGeneratorService.listQuestions({
    page: 1,
    limit: 5
  });

  console.log("   Total de questões no acervo:", listPage1.total);
  console.log("   Questões retornadas na página 1:", listPage1.questoes.length);
  console.log("   Possui próxima página (hasNext):", listPage1.hasNext);

  if (!listPage1.questoes || listPage1.questoes.length === 0) {
    throw new Error("Banco de questões retornou 0 questões!");
  }

  const primeiraQuestao = listPage1.questoes[0];
  console.log("   Exemplo da Questão 1:", {
    id: primeiraQuestao.id,
    banca: primeiraQuestao.banca,
    especialidade: primeiraQuestao.especialidade,
    enunciadoResumido: primeiraQuestao.enunciado.slice(0, 60) + "...",
    totalAlternativas: primeiraQuestao.alternativas.length,
    respostaCorreta: primeiraQuestao.resposta_correta
  });

  // Filtro por Especialidade
  const listCardio = await QuestoesGeneratorService.listQuestions({
    especialidade: "Clínica Médica",
    limit: 5
  });
  console.log(`   Questões filtradas por 'Clínica Médica': ${listCardio.questoes.length} retornadas`);

  // ----------------------------------------------------
  // TESTE 5: Responder Questões e Registrar Progresso Real
  // ----------------------------------------------------
  console.log("\n[TESTE 5] Submetendo respostas do Estudante A e verificando estatísticas...");
  const q1 = listPage1.questoes[0];
  const q2 = listPage1.questoes[1] || listPage1.questoes[0];

  // Resposta 1: Correta
  const ans1 = await QuestoesGeneratorService.recordAnswer({
    userId: userA.id,
    userEmail: userA.email,
    questaoId: q1.id,
    alternativaSelecionada: q1.resposta_correta,
    tempoSegundos: 45
  });
  console.log("   Submissão 1:", { acertou: ans1.acertou, gabarito: ans1.respostaCorreta });
  if (!ans1.acertou) throw new Error("Deveria ter acertado a questão 1!");

  // Resposta 2: Incorreta (alternativa errada propositalmente)
  const wrongAlt = (q2.resposta_correta + 1) % 4;
  const ans2 = await QuestoesGeneratorService.recordAnswer({
    userId: userA.id,
    userEmail: userA.email,
    questaoId: q2.id,
    alternativaSelecionada: wrongAlt,
    tempoSegundos: 30
  });
  console.log("   Submissão 2 (erro proposital):", { acertou: ans2.acertou, selecionada: wrongAlt, gabarito: ans2.respostaCorreta });
  if (ans2.acertou) throw new Error("Deveria ter errado a questão 2!");

  // Consultar Progresso Real do Estudante
  const progressA = await QuestoesGeneratorService.getUserStudyProgress(userA.id, userA.email);
  console.log("   Progresso do Estudante A:", {
    totalRespondidas: progressA.totalRespondidas,
    acertos: progressA.acertos,
    erros: progressA.erros,
    aproveitamento: `${progressA.aproveitamento}%`,
    porEspecialidade: progressA.porEspecialidade
  });

  if (progressA.totalRespondidas !== 2 || progressA.acertos !== 1 || progressA.erros !== 1) {
    throw new Error("Estatísticas de progresso não refletem as respostas enviadas!");
  }
  console.log("   ✅ Progresso e histórico de respostas 100% integrados e persistidos!");

  // ----------------------------------------------------
  // TESTE 6: Isolamento entre Usuários A e B
  // ----------------------------------------------------
  console.log("\n[TESTE 6] Verificando isolamento de progresso do Usuário B...");
  const progressB = await QuestoesGeneratorService.getUserStudyProgress(userB.id, userB.email);
  console.log("   Progresso do Usuário B:", {
    totalRespondidas: progressB.totalRespondidas,
    acertos: progressB.acertos
  });

  if (progressB.totalRespondidas !== 0) {
    throw new Error("Progresso do Usuário A vazou para o Usuário B!");
  }
  console.log("   ✅ Isolamento total de progresso confirmado!");

  console.log("\n==================================================");
  console.log("🎉 TODOS OS TESTES DE QUESTÕES E PLANOS PASSARAM COM SUCESSO!");
  console.log("==================================================");
}

runQuestionsAndPlansTest().catch(err => {
  console.error("❌ Falha no teste:", err);
  process.exit(1);
});
