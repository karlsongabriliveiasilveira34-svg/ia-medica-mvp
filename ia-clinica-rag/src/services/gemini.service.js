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

function isTransientGeminiError(error) {
  if (!error) return false;
  if (error.status === 429 || error.status === 503) return true;
  const msg = typeof error.message === "string" ? error.message : "";
  return msg.includes("429") || msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE") || msg.includes("RESOURCE_EXHAUSTED");
}

function calculateRetryWaitMs(error, defaultDelayMs) {
  let waitMs = defaultDelayMs;
  const retryMatch = typeof error.message === "string" && error.message.match(/retry in (\d+(\.\d+)?)s/i);
  if (retryMatch && retryMatch[1]) {
    waitMs = Math.max(waitMs, (Number.parseFloat(retryMatch[1]) + 2) * 1000);
  }
  return waitMs;
}

/**
 * Wrapper com retry automático e LOG ABSOLUTO / TOTAL (Prompt enviado + Pensamento / Resposta bruta)
 */
export async function generateWithRetry(params, retries = 5, initialDelayMs = 8000) {
  const modelName = params.model || env.geminiModel;
  const promptText = typeof params.contents === "string" ? params.contents : JSON.stringify(params.contents);

  console.log(`\n======================================================`);
  console.log(`🤖 [LOG TOTAL GEMINI - ENVIO] Chamando API do Gemini (${modelName})`);
  console.log(`📝 --- PROMPT COMPLETO ENVIADO AO GEMINI ---`);
  console.log(promptText);
  console.log(`------------------------------------------------------`);

  let delayMs = initialDelayMs;

  for (let i = 0; i < retries; i++) {
    try {
      const startTime = Date.now();
      const res = await gemini.models.generateContent(params);
      const durationMs = Date.now() - startTime;

      console.log(`\n✅ [LOG TOTAL GEMINI - RESPOSTA] Sucesso em ${durationMs}ms`);
      console.log(`📊 Tamanho da Resposta: ${res.text?.length || 0} caracteres`);
      console.log(res.text);
      console.log(`======================================================\n`);

      return res;
    } catch (error) {
      console.error(`\n❌ [LOG TOTAL GEMINI - ERRO] Falha na Chamada (Tentativa ${i + 1}/${retries}): ${error.message}`);
      const isTransient = isTransientGeminiError(error);
      if (isTransient && i < retries - 1) {
        const waitMs = calculateRetryWaitMs(error, delayMs);
        console.warn(`⚠️ [LOG COTA GEMINI] Erro temporário. Aguardando ${Math.round(waitMs / 1000)}s...`);
        await sleep(waitMs);
        delayMs *= 1.5;
      } else {
        throw error;
      }
    }
  }
}
