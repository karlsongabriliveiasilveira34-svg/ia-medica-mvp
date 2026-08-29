import "dotenv/config";
import crypto from "node:crypto";

const required = [
  "DATABASE_URL",
  "GEMINI_API_KEY"
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`⚠️ Variável de ambiente ausente: ${key}`);
  }
}

// Chaves criptográficas geradas de forma segura e dinâmica quando não providas por variáveis de ambiente
const fallbackJwt = crypto.randomBytes(32).toString("hex");
const fallbackPiiKey = crypto.randomBytes(32).toString("hex");
const fallbackSalt = crypto.randomBytes(32).toString("hex");

export const env = {
  port: Number.parseInt(process.env.PORT || "3000", 10),

  databaseUrl: process.env.DATABASE_URL || "",

  geminiApiKey: process.env.GEMINI_API_KEY || "",

  geminiModel:
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

  embeddingModel:
    process.env.GEMINI_EMBEDDING_MODEL ||
    "gemini-embedding-2",

  embeddingDimensions:
    Number.parseInt(process.env.EMBEDDING_DIMENSIONS || "768", 10),

  demoPassword: process.env.DEMO_PASSWORD || "",

  jwtSecret: process.env.JWT_SECRET || fallbackJwt,

  piiEncryptionKey:
    process.env.PII_ENCRYPTION_KEY || fallbackPiiKey,

  blindIndexSalt:
    process.env.BLIND_INDEX_SALT || fallbackSalt
};