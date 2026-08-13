import { gemini } from "./gemini.service.js";
import { env } from "../config/env.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gera vetor de embedding com suporte a retry automático em 429 (Rate Limit / Cota Excedida) e Fallback Local
 */
export async function createEmbedding(text, retries = 5, delayMs = 3000) {
  const cleanText = text ? text.substring(0, 4000) : "";

  for (let i = 0; i < retries; i++) {
    try {
      const response = await gemini.models.embedContent({
        model: env.embeddingModel,
        contents: cleanText,
        config: {
          outputDimensionality: env.embeddingDimensions || 768
        }
      });

      if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
        return response.embeddings[0].values;
      }
    } catch (error) {
      const isRateLimit = error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")));
      
      if (isRateLimit && i < retries - 1) {
        console.warn(`⚠️ Rate limit (429) no embedding. Aguardando ${delayMs / 1000}s (Tentativa ${i + 1}/${retries})...`);
        await sleep(delayMs);
        delayMs *= 2;
      } else if (i === retries - 1) {
        console.warn("⚠️ Cota do Gemini excedida para embeddings. Gerando vetor determinístico local de fallback para não interromper a ingestão...");
        return createFallbackEmbedding(cleanText, env.embeddingDimensions || 768);
      } else {
        await sleep(1000);
      }
    }
  }

  return createFallbackEmbedding(cleanText, env.embeddingDimensions || 768);
}

/**
 * Gera um vetor pseudo-randômico determinístico baseado em hash para evitar travamento da base quando a API estoura cota
 */
function createFallbackEmbedding(text, dim = 768) {
  const vector = new Array(dim).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let d = 0; d < dim; d++) {
    vector[d] = Math.sin(hash + d * 0.1);
  }
  return vector;
}