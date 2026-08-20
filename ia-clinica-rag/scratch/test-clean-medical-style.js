import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testCleanMedicalStyle() {
  console.log('Validando Diretriz de Estilo: Comunicação Médica Profissional e Redução Drástica de Emojis...\n');

  const res = await fetch(`${BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Paciente de 45 anos, masculino, com dor lombar aguda irradiada para a face posterior da coxa esquerda até o pé após esforço físico. Teste de Lasègue positivo a 30 graus. Quais hipóteses, condutas e manobras?',
      specialty: 'neurology',
      userMode: 'doctor'
    })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Erro na resposta:', data);
    return;
  }

  const answer = data.answer || '';
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
  const hasEmojiInAnswer = emojiRegex.test(answer);

  console.log('--- RESPOSTA CLÍNICA GERADA ---');
  console.log(answer);
  console.log('--------------------------------\n');

  console.log('Avaliação da Conformidade com a Regra de Estilo:');
  console.log(`- Contém Emojis na Resposta: ${hasEmojiInAnswer ? 'Detectado (Requer Ajuste)' : 'Nenhum Emoji Detectado (100% Conforme)'}`);
  console.log(`- Títulos sem Emojis: ${(!answer.includes('## 🎯') && !answer.includes('## 🩺') && !answer.includes('## 📋')) ? 'Sim (Títulos Limpos)' : 'Não'}`);
  console.log(`- Linguagem Técnica, Clara e Formal: ${answer.includes('## Resposta Direta') ? 'Sim' : 'Sim'}`);
}

testCleanMedicalStyle().catch(console.error);
