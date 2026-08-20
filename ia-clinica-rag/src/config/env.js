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

  jwtSecret: process.env.JWT_SECRET || "ia-clinica-secret-key-2026"
};