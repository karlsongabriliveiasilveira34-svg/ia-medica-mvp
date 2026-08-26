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

// 1. Desabilitar identificação do Express (Anti-Fingerprinting)
app.disable("x-powered-by");

// 2. Headers de Segurança HTTP (Anti-XSS, Anti-Clickjacking, No-Sniff)
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  next();
});

// 3. Middlewares Globais de Rede, Rate Limiting e Payload
app.use(generalLimiter);
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 4. Sanitização Global de Dados e Proteção XSS
app.use(deepSanitizeMiddleware);

// Cache de caminhos e conteúdo estático em memória no boot (evita I/O de disco por requisição)
const frontendDist = path.resolve(__dirname, "../frontend/dist");
const frontendOut = path.resolve(__dirname, "../frontend/out");
const knowledgeDir = path.resolve(__dirname, "../knowledge");
const indexHtmlPath = path.resolve(frontendDist, "index.html");

const hasDist = fs.existsSync(frontendDist);
const hasOut = fs.existsSync(frontendOut);
const hasKnowledge = fs.existsSync(knowledgeDir);
const hasIndexHtml = fs.existsSync(indexHtmlPath);
const indexHtmlContent = hasIndexHtml ? fs.readFileSync(indexHtmlPath, "utf8") : null;

if (hasDist) app.use(express.static(frontendDist, { dotfiles: "ignore", maxAge: "1d" }));
if (hasOut) app.use(express.static(frontendOut, { dotfiles: "ignore", maxAge: "1d" }));
if (hasKnowledge) app.use("/knowledge", express.static(knowledgeDir, { dotfiles: "ignore", maxAge: "1d" }));

// Rotas da API
app.use(apiRouter);

// Handler seguro para rotas não encontradas (atendido 100% da memória com rate limiter ativo)
app.use(generalLimiter, (req, res, next) => {
  if (req.accepts("html") && !req.path.startsWith("/api") && indexHtmlContent) {
    return res.type("html").send(indexHtmlContent);
  }
  if (!res.headersSent) {
    res.status(404).json({ status: "error", message: `Rota ${req.method} ${req.path} não encontrada.` });
  }
});

// Middleware de tratamento global de erros (sem expor stack traces em produção)
app.use((err, req, res, next) => {
  console.error("🔥 Erro capturado na aplicação:", err.message);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Erro interno do servidor",
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
    });
  }
});
