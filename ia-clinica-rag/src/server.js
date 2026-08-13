import { app } from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port || 3000;

app.listen(PORT, () => {
  console.log("=================================================");
  console.log(`🏥 IA Clínica RAG (Agentic System) rodando!`);
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🤖 Modelo Gemini: ${env.geminiModel}`);
  console.log(`📐 Embedding: ${env.embeddingModel} (${env.embeddingDimensions}d)`);
  console.log("=================================================");
});
