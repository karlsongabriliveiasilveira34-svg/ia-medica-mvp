import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api.routes.js";
import { generalLimiter } from "./middleware/rate-limiter.middleware.js";
import { deepSanitizeMiddleware } from "./middleware/security-sanitizer.middleware.js";

// Polifyll para Web APIs exigidas por pdf-parse / canvas no Node.js 20+ (Vercel)
if (typeof global.DOMMatrix === "undefined") {
  global.DOMMatrix = class DOMMatrix { constructor() { this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0; } };
}
if (typeof global.Path2D === "undefined") {
  global.Path2D = class Path2D {};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// 1. Headers de Segurança HTTP (Anti-XSS, Anti-Clickjacking, No-Sniff)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  next();
});

// 2. Middlewares Globais de Rede e Payload
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 3. Sanitização Global de Dados e Proteção XSS
app.use(deepSanitizeMiddleware);

// 4. Rate Limiting Geral para Rotas da API
app.use("/api", generalLimiter);

// Servir arquivos estáticos do frontend e pasta de conhecimento (se existirem localmente)
const frontendDist = path.join(__dirname, "../frontend/dist");
const frontendOut = path.join(__dirname, "../frontend/out");
const knowledgeDir = path.join(__dirname, "../knowledge");

if (fs.existsSync(frontendDist)) app.use(express.static(frontendDist));
if (fs.existsSync(frontendOut)) app.use(express.static(frontendOut));
if (fs.existsSync(knowledgeDir)) app.use("/knowledge", express.static(knowledgeDir));

// Rotas da API
app.use(apiRouter);

// Handler para rotas não encontradas
app.use((req, res, next) => {
  if (req.accepts("html") && !req.path.startsWith("/api") && fs.existsSync(path.join(frontendDist, "index.html"))) {
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
