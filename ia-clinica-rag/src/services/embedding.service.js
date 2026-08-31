import { gemini } from "./gemini.service.js";
import { env } from "../config/env.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function handleEmbeddingError(error, attempt, maxRetries) {
  const isQuotaExhausted = error.message && (error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED"));
  if (isQuotaExhausted) {
    throw new Error(`⚠️ Cota diária de embeddings excedida (RESOURCE_EXHAUSTED): ${error.message}`);
  }

  const isRateLimit = error.status === 429 || (error.message && error.message.includes("429"));
  if (attempt === maxRetries - 1) {
    throw new Error(`❌ Falha na geração de embedding Gemini: ${error.message}`);
  }

  return isRateLimit;
}

/**
 * Gera vetor de embedding com suporte a retry automático em 429 (Rate Limit / Cota Excedida) e Fallback Local
 */
export async function createEmbedding(text, retries = 5, initialDelayMs = 3000) {
  const cleanText = text ? text.substring(0, 4000) : "";
  if (!cleanText) {
    throw new Error("Texto para embedding não pode ser vazio.");
  }

  let delayMs = initialDelayMs;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await gemini.models.embedContent({
        model: env.embeddingModel,
        contents: cleanText,
        config: {
          outputDimensionality: env.embeddingDimensions || 768
        }
      });

      if (response.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch (error) {
      const isRateLimit = handleEmbeddingError(error, i, retries);
      if (isRateLimit) {
        console.warn(`⚠️ Rate limit (429) no embedding. Aguardando ${delayMs / 1000}s (Tentativa ${i + 1}/${retries})...`);
        await sleep(delayMs);
        delayMs *= 1.5;
      } else {
        await sleep(500);
      }
    }
  }

  throw new Error("❌ Falha desconhecida na geração de embedding.");
}