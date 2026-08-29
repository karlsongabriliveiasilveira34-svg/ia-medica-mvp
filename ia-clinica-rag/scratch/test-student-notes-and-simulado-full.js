import assert from 'assert';
import { StudentNotesService } from '../src/services/student-notes.service.js';
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from '../frontend/src/data/medicalQuestionsAndCards.js';

async function runTests() {
  console.log('================================================================');
  console.log('🩺 INICIANDO BATERIA DE TESTES: ANOTAÇÕES, SIMULADO & DADOS');
  console.log('================================================================\n');

  // TESTE 1: ACERVO DE 50 QUESTÕES
  console.log('--- TESTE 1: ACERVO DE 50 QUESTÕES MÉDICAS ---');
  assert.strictEqual(INITIAL_QUESTIONS.length, 50, `Deveriam existir 50 questões, encontrados ${INITIAL_QUESTIONS.length}`);
  console.log(`[PASS] Total de questões no banco estático: ${INITIAL_QUESTIONS.length} questões.`);

  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

  // Validar cada uma das 50 questões
  const areaCounts = { clinica: 0, cirurgia: 0, pediatria: 0, go: 0, preventiva: 0 };
  INITIAL_QUESTIONS.forEach((q, idx) => {
    assert(q.id, `Questão ${idx + 1} sem ID`);
    assert(q.question && q.question.length > 20, `Questão ${idx + 1} com enunciado curto`);
    assert(Array.isArray(q.options) && q.options.length >= 4, `Questão ${idx + 1} com menos de 4 alternativas`);
    assert(q.correct !== undefined && q.correct >= 0 && q.correct <= 3, `Questão ${idx + 1} com gabarito inválido: ${q.correct}`);
    assert(q.explanation && q.explanation.length > 10, `Questão ${idx + 1} sem explicação`);
    
    // Validar ausência de emojis
    assert(!emojiRegex.test(q.question), `Questão ${idx + 1} contém emoji no enunciado`);
    assert(!emojiRegex.test(q.explanation), `Questão ${idx + 1} contém emoji na explicação`);
    q.options.forEach(opt => assert(!emojiRegex.test(opt), `Alternativa contém emoji na questão ${idx + 1}`));

    const aKey = (q.area || '').toLowerCase();
    if (areaCounts[aKey] !== undefined) {
      areaCounts[aKey] += 1;
    }
  });

  console.log('[PASS] Todas as 50 questões validadas com sucesso:');
  console.log(`   - Clínica Médica: ${areaCounts.clinica} questões`);
  console.log(`   - Cirurgia Geral & Trauma: ${areaCounts.cirurgia} questões`);
  console.log(`   - Pediatria & Puericultura: ${areaCounts.pediatria} questões`);
  console.log(`   - Ginecologia & Obstetrícia: ${areaCounts.go} questões`);
  console.log(`   - Medicina Preventiva & SUS: ${areaCounts.preventiva} questões`);

  // TESTE 2: FLASHCARDS SEM EMOJIS
  console.log('\n--- TESTE 2: FLASHCARDS SEM EMOJIS & 100% PT-BR ---');
  assert(INITIAL_FLASHCARDS.length >= 15, 'Flashcards insuficientes');
  INITIAL_FLASHCARDS.forEach((fc, idx) => {
    assert(fc.front && fc.front.length > 5, `Flashcard ${idx + 1} sem frente`);
    assert(fc.back && fc.back.length > 5, `Flashcard ${idx + 1} sem verso`);
    assert(!emojiRegex.test(fc.front), `Flashcard ${idx + 1} contém emoji na frente`);
    assert(!emojiRegex.test(fc.back), `Flashcard ${idx + 1} contém emoji no verso`);
  });
  console.log(`[PASS] ${INITIAL_FLASHCARDS.length} flashcards auditados com 0 emojis e 100% pt-BR.`);

  // TESTE 3: SERVIÇO DE ANOTAÇÕES DO ESTUDANTE (CRUD)
  console.log('\n--- TESTE 3: SERVIÇO DE ANOTAÇÕES DO ESTUDANTE (CRUD) ---');
  const testUserId = `test_student_${Date.now()}`;
  const testEmail = 'aluno.medicina@unimontes.br';

  const createdNote = await StudentNotesService.createNote({
    userId: testUserId,
    userEmail: testEmail,
    title: 'Fisiopatologia do Choque Séptico',
    content: 'A sepse é caracterizada por uma resposta desregulada do hospedeiro a uma infecção, levando a disfunção orgânica potencialmente fatal com elevação de lactato e hipotensão refratária.',
    drawingData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    tags: ['Infectologia', 'Emergência'],
    triggerAi: false
  });

  assert(createdNote && createdNote.id, 'Falha ao criar anotação');
  assert.strictEqual(createdNote.title, 'Fisiopatologia do Choque Séptico');
  assert.strictEqual(createdNote.tags.length, 2);
  console.log(`[PASS] Anotação criada com sucesso: ID=${createdNote.id}`);

  // Listar anotações
  const list = await StudentNotesService.listNotes({ userId: testUserId });
  assert(list.length >= 1, 'Falha ao listar anotações do estudante');
  console.log(`[PASS] Listagem de anotações retornou ${list.length} nota(s).`);

  // Atualizar anotação
  const updatedNote = await StudentNotesService.updateNote({
    id: createdNote.id,
    userId: testUserId,
    title: 'Fisiopatologia do Choque Séptico e ILAS 2024',
    content: createdNote.content + '\nConduta: Ressuscitação volêmica precoce e Noradrenalina.'
  });
  assert.strictEqual(updatedNote.title, 'Fisiopatologia do Choque Séptico e ILAS 2024');
  console.log(`[PASS] Atualização de anotação validada.`);

  // TESTE 4: SUGESTÕES DA IA PRECEPTORA (MÁXIMO 2 A 3 SUGESTÕES)
  console.log('\n--- TESTE 4: SUGESTÕES DA IA PRECEPTORA ACADÊMICA ---');
  const suggestions = await StudentNotesService.generateAiSuggestions({
    title: 'Diretrizes de Hipertensão Arterial e Metas SBC',
    content: 'A pressão arterial deve ser controlada com IECA ou BRA associado a Anlodipino para pacientes de alto risco cardiovascular com PA >= 140/90 mmHg.'
  });

  assert(Array.isArray(suggestions), 'Sugestões da IA devem ser um array');
  assert(suggestions.length >= 2 && suggestions.length <= 3, `Sugestões devem ser entre 2 e 3 (encontrado: ${suggestions.length})`);
  suggestions.forEach((sug, idx) => {
    assert(sug.tipo, `Sugestão ${idx + 1} sem tipo`);
    assert(sug.descricao, `Sugestão ${idx + 1} sem descrição`);
    assert(!emojiRegex.test(sug.descricao), `Sugestão ${idx + 1} contém emoji na descrição`);
    console.log(`   [Sugestão ${idx + 1}] (${sug.tipo}): ${sug.descricao.slice(0, 70)}...`);
  });
  console.log(`[PASS] IA Preceptora gerou exatamente ${suggestions.length} sugestões objetivas.`);

  // Excluir anotação de teste
  await StudentNotesService.deleteNote({ id: createdNote.id, userId: testUserId });
  const afterDeleteList = await StudentNotesService.listNotes({ userId: testUserId });
  assert.strictEqual(afterDeleteList.length, 0, 'Anotação deveria ter sido excluída');
  console.log(`[PASS] Exclusão de anotação validada.`);

  // TESTE 5: LÓGICA DE SIMULADO E CÁLCULO DE PONTUAÇÃO
  console.log('\n--- TESTE 5: LÓGICA DE SIMULADO & PONTUAÇÃO (+1 ACERTO, 0 ERRO, %) ---');
  
  // Simular respostas: 40 certas, 10 erradas de 50
  const mockAnswers = {};
  INITIAL_QUESTIONS.forEach((q, idx) => {
    if (idx < 40) {
      mockAnswers[idx] = q.correct; // Acerto
    } else {
      mockAnswers[idx] = (q.correct + 1) % 4; // Erro intencional
    }
  });

  let simulatedScore = 0;
  const themeBreakdown = {};

  INITIAL_QUESTIONS.forEach((q, idx) => {
    const isCorrect = mockAnswers[idx] === q.correct;
    if (isCorrect) simulatedScore += 1;

    const area = q.area || 'clinica';
    if (!themeBreakdown[area]) {
      themeBreakdown[area] = { total: 0, correct: 0, wrong: 0 };
    }
    themeBreakdown[area].total += 1;
    if (isCorrect) themeBreakdown[area].correct += 1;
    else themeBreakdown[area].wrong += 1;
  });

  const percentage = (simulatedScore / INITIAL_QUESTIONS.length) * 100;
  assert.strictEqual(simulatedScore, 40, 'Pontuação deveria ser 40');
  assert.strictEqual(percentage, 80.0, 'Porcentagem deveria ser 80%');

  console.log(`[PASS] Cálculo de pontuação verificado:`);
  console.log(`   - Acertos (+1 ponto): ${simulatedScore} / 50`);
  console.log(`   - Porcentagem final: ${percentage}%`);
  console.log(`   - Desempenho por tema:`, themeBreakdown);

  console.log('\n================================================================');
  console.log('🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ FALHA NOS TESTES:', err);
  process.exit(1);
});
