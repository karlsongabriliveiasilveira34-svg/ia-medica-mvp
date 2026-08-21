import "dotenv/config";

const required = [
  "DATABASE_URL",
  "GEMINI_API_KEY"
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`⚠️ Variável de ambiente ausente: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 3000),

  databaseUrl: process.env.DATABASE_URL || "postgresql://clinica:clinica_dev@localhost:5432/clinica_rag",

  geminiApiKey: process.env.GEMINI_API_KEY || "",

  geminiModel:
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

  embeddingModel:
    process.env.GEMINI_EMBEDDING_MODEL ||
    "gemini-embedding-2",

  embeddingDimensions:
    Number(process.env.EMBEDDING_DIMENSIONS || 768),

  demoPassword: process.env.DEMO_PASSWORD || "clinica2026",

  jwtSecret: process.env.JWT_SECRET || "ia-clinica-secret-key-2026",

  piiEncryptionKey:
    process.env.PII_ENCRYPTION_KEY || "e5dd7027acd6e809e0787dae1318778c14d397385ff39e18f28d47408c0a39b2",

  blindIndexSalt:
    process.env.BLIND_INDEX_SALT || "9f8b7c6d5e4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c"
};