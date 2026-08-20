import { Router } from "express";
import multer from "multer";
import { checkHealth } from "../controllers/health.controller.js";
import { handleQuery } from "../controllers/query.controller.js";
import { 
  handleListDocuments, 
  handleUploadDocument, 
  handleDeleteDocument 
} from "../controllers/document.controller.js";
import { handleListAgents } from "../controllers/agent.controller.js";
import { handleCreateSession, handleListSessions, handleGetSession, handleAnalyzeCase, handleRecordPhysicianDecision } from "../controllers/session.controller.js";
import { handleSaveFeedback } from "../controllers/feedback.controller.js";
import { 
  handleGetSourcePage, 
  handleListSources, 
  handleRegisterOfficialSource, 
  handleUpdateSourceStatus 
} from "../controllers/source.controller.js";
import { 
  handleGenerateReportFromReasoning, 
  handleProcessAudio, 
  handleUpdateConsultation, 
  handleGetConsultation, 
  handleListConsultations, 
  handleUploadConsultationMedia 
} from "../controllers/consultation.controller.js";

import { authRouter } from "./auth.routes.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // Limite de 50MB por PDF
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos no formato PDF são permitidos."));
    }
  }
});

const queryImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB para imagem clínica
  }
});

export const apiRouter = Router();

// Endpoint de Healthcheck (Público)
apiRouter.get("/health", checkHealth);

// Rotas de Autenticação (Públicas)
apiRouter.use(authRouter);

// Aplicar Middleware de Autenticação para todas as rotas de API subsequentes
apiRouter.use("/api", requireAuth);

// Endpoint principal do Agentic RAG Multiagente (suporta texto e/ou upload de imagem)
apiRouter.post("/api/query", queryImageUpload.single("image"), handleQuery);

// Agentes de Especialidades
apiRouter.get("/api/agents", handleListAgents);

// Catálogo de Fontes Oficiais e Deep-Links por Página
apiRouter.get("/api/sources", handleListSources);
apiRouter.post("/api/sources/register", handleRegisterOfficialSource);
apiRouter.patch("/api/sources/:id/status", handleUpdateSourceStatus);
apiRouter.get("/api/sources/:id/page/:page", handleGetSourcePage);

// Sessões Clínicas e Registro Médico-Legal
apiRouter.post("/api/sessions", handleCreateSession);
apiRouter.get("/api/sessions", handleListSessions);
apiRouter.get("/api/sessions/:id", handleGetSession);
apiRouter.post("/api/sessions/:id/analyze", handleAnalyzeCase);
apiRouter.post("/api/sessions/:id/decision", handleRecordPhysicianDecision);

// Entidade Central: Consultas Clínicas, Laudos Editáveis & Ambient AI Scribe
apiRouter.post("/api/consultations/generate", handleGenerateReportFromReasoning);
apiRouter.post("/api/consultations/process-audio", handleProcessAudio);
apiRouter.get("/api/consultations", handleListConsultations);
apiRouter.get("/api/consultations/:id", handleGetConsultation);
apiRouter.put("/api/consultations/:id", handleUpdateConsultation);
apiRouter.post("/api/consultations/:id/media", handleUploadConsultationMedia);

// Feedback do Médico
apiRouter.post("/api/feedback", handleSaveFeedback);

// Endpoints da Base de Conhecimento
apiRouter.get("/api/documents", handleListDocuments);
apiRouter.post("/api/documents/upload", upload.single("file"), handleUploadDocument);
apiRouter.delete("/api/documents/:id", handleDeleteDocument);
