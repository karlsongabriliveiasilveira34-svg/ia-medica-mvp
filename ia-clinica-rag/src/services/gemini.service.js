import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

let geminiClientInstance = null;

function getClient() {
  if (!geminiClientInstance) {
    const key = (env.geminiApiKey && env.geminiApiKey.trim()) || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) || "";
    geminiClientInstance = new GoogleGenAI({ apiKey: key });
  }
  return geminiClientInstance;
}

export const gemini = {
  models: {
    generateContent: (params) => getClient().models.generateContent(params),
    embedContent: (params) => getClient().models.embedContent(params)
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wrapper com retry automático e LOG ABSOLUTO / TOTAL (Prompt enviado + Pensamento / Resposta bruta)
 */
export async function generateWithRetry(params, retries = 5, delayMs = 8000) {
  const modelName = params.model || env.geminiModel;
  const promptText = typeof params.contents === "string" ? params.contents : JSON.stringify(params.contents);

  console.log(`\n======================================================`);
  console.log(`🤖 [LOG TOTAL GEMINI - ENVIO] Chamando API do Gemini`);
  console.log(`⏱️ Data/Hora: ${new Date().toISOString()}`);
  console.log(`📌 Modelo Utilizado: ${modelName}`);
  console.log(`📄 MimeType Solicitado: ${params.config?.responseMimeType || "text/plain"}`);
  console.log(`📝 --- PROMPT COMPLETO ENVIADO AO GEMINI ---`);
  console.log(promptText);
  console.log(`------------------------------------------------------`);

  for (let i = 0; i < retries; i++) {
    try {
      const startTime = Date.now();
      const res = await gemini.models.generateContent(params);
      const durationMs = Date.now() - startTime;

      console.log(`\n✅ [LOG TOTAL GEMINI - RESPOSTA] Sucesso em ${durationMs}ms`);
      console.log(`📊 Tamanho da Resposta: ${res.text?.length || 0} caracteres`);
      console.log(`💬 --- RESPOSTA BRUTA / PENSAMENTO DO GEMINI ---`);
      console.log(res.text);
      console.log(`======================================================\n`);

      return res;
    } catch (error) {
      console.error(`\n❌ [LOG TOTAL GEMINI - ERRO] Falha na Chamada (Tentativa ${i + 1}/${retries}):`);
      console.error(`   - Status HTTP: ${error.status || "DESCONHECIDO"}`);
      console.error(`   - Código: ${error.code || "N/A"}`);
      console.error(`   - Mensagem de Erro: ${error.message}`);
      console.error(`======================================================\n`);

      const isTransient = error.status === 429 || error.status === 503 || (error.message && (error.message.includes("429") || error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE") || error.message.includes("RESOURCE_EXHAUSTED")));
      if (isTransient && i < retries - 1) {
        let waitMs = delayMs;
        const retryMatch = typeof error.message === "string" && error.message.match(/retry in (\d+(\.\d+)?)s/i);
        if (retryMatch && retryMatch[1]) {
          waitMs = Math.max(waitMs, (Number.parseFloat(retryMatch[1]) + 2) * 1000);
        }
        console.warn(`⚠️ [LOG COTA GEMINI] Erro temporário / alta demanda (${error.status || "503/429"}). Aguardando ${Math.round(waitMs / 1000)}s para tentar novamente...`);
        await sleep(waitMs);
        delayMs *= 1.5;
      } else {
        throw error;
      }
    }
  }
}
