import { gemini } from '../src/services/gemini.service.js';

const modelsToTest = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-3.5-flash-lite',
  'gemini-1.5-pro'
];

async function testModels() {
  console.log('🧪 Testando modelos válidos na API do Google Gemini...\n');
  for (const model of modelsToTest) {
    try {
      const res = await gemini.models.generateContent({
        model,
        contents: 'Responda com OK em uma palavra.'
      });
      console.log(`✅ MODELO VÁLIDO: "${model}" -> Resposta: "${res.text?.trim()}"`);
    } catch (err) {
      console.log(`❌ MODELO INVÁLIDO: "${model}" -> Erro: ${err.message?.split('\n')[0]}`);
    }
  }
}

testModels().catch(console.error);
