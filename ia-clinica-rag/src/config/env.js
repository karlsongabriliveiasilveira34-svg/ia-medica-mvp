import "dotenv/config";
import crypto from "crypto";

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
  port: Number(process.env.PORT || 3000),

  databaseUrl: process.env.DATABASE_URL || "postgresql://clinica:clinica_dev@localhost:5432/clinica_rag",

  geminiApiKey: process.env.GEMINI_API_KEY || "",

  geminiModel:
    process.env.GEMINI_MODEL || "gemini-2.0-flash",

  embeddingModel:
    process.env.GEMINI_EMBEDDING_MODEL ||
    "text-embedding-004",

  embeddingDimensions:
    Number(process.env.EMBEDDING_DIMENSIONS || 768),

  demoPassword: process.env.DEMO_PASSWORD || "clinica2026",

  jwtSecret: process.env.JWT_SECRET || fallbackJwt,

  piiEncryptionKey:
    process.env.PII_ENCRYPTION_KEY || fallbackPiiKey,

  blindIndexSalt:
    process.env.BLIND_INDEX_SALT || fallbackSalt
};