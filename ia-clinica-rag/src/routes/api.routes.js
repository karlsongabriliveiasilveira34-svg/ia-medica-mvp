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
import { handleCreateSession, handleGetSession } from "../controllers/session.controller.js";
import { handleSaveFeedback } from "../controllers/feedback.controller.js";
import { handleGetSourcePage } from "../controllers/source.controller.js";

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

export const apiRouter = Router();

// Endpoint de Healthcheck
apiRouter.get("/health", checkHealth);

// Endpoint principal do Agentic RAG Multiagente
apiRouter.post("/api/query", handleQuery);

// Agentes de Especialidades
apiRouter.get("/api/agents", handleListAgents);

// Fontes e Deep-Links por Página
apiRouter.get("/api/sources/:id/page/:page", handleGetSourcePage);

// Sessões Clínicas
apiRouter.post("/api/sessions", handleCreateSession);
apiRouter.get("/api/sessions/:id", handleGetSession);

// Feedback do Médico
apiRouter.post("/api/feedback", handleSaveFeedback);

// Endpoints da Base de Conhecimento
apiRouter.get("/api/documents", handleListDocuments);
apiRouter.post("/api/documents/upload", upload.single("file"), handleUploadDocument);
apiRouter.delete("/api/documents/:id", handleDeleteDocument);
