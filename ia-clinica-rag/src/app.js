import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Servir arquivos estáticos do frontend e pasta de conhecimento (PDFs)
const frontendDist = path.join(__dirname, "../frontend/dist");
const frontendOut = path.join(__dirname, "../frontend/out");
const knowledgeDir = path.join(__dirname, "../knowledge");

app.use(express.static(frontendDist));
app.use(express.static(frontendOut));
app.use("/knowledge", express.static(knowledgeDir));

// Rotas da API
app.use(apiRouter);

// Handler para rotas não encontradas
app.use((req, res, next) => {
  if (req.accepts("html") && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(frontendDist, "index.html"), (err) => {
      if (err) {
        res.status(404).json({ status: "error", message: "Rota não encontrada" });
      }
    });
  }
  res.status(404).json({ status: "error", message: `Rota ${req.method} ${req.path} não encontrada.` });
});

// Middleware de tratamento global de erros
app.use((err, req, res, next) => {
  console.error("🔥 Erro não tratado na aplicação:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
});
