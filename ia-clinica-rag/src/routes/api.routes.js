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
import { LgpdController } from "../controllers/lgpd.controller.js";

import { authRouter } from "./auth.routes.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logSanitizerMiddleware } from "../middleware/log-sanitizer.middleware.js";

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

import { 
  getPediatricMedicationsHandler,
  calculateDoseHandler,
  calculateZScoreHandler,
  validateVaccinesHandler,
  checkRedFlagsHandler
} from "../controllers/pediatric.controller.js";
import {
  createPreAnamneseSessionHandler,
  getPreAnamneseByTokenHandler,
  submitPreAnamneseHandler,
  getDoctorWorklistHandler,
  getAnamneseDetailsHandler
} from "../controllers/pre-anamnese.controller.js";
import {
  fhirEncounterHandler,
  webhookAgendamentoCriadoHandler
} from "../controllers/fhir.controller.js";

// Aplicar Middleware de Sanitização de Logs (Prevenção de Vazamento de PII)
apiRouter.use(logSanitizerMiddleware);

// Endpoint de Healthcheck (Público)
apiRouter.get("/health", checkHealth);

// Rotas de Autenticação (Públicas)
apiRouter.use(authRouter);

// --- ROTAS PÚBLICAS DO PORTAL DO PACIENTE (ANAMNESE PRÉVIA EM CASA) ---
apiRouter.get("/api/public/pre-anamnese/:token", getPreAnamneseByTokenHandler);
apiRouter.post("/api/public/pre-anamnese/:token/submit", submitPreAnamneseHandler);

// --- ROTAS DE INTEROPERABILIDADE HL7 FHIR & WEBHOOKS DE ERPS HOSPITALARES ---
apiRouter.post("/api/v1/fhir/Encounter", fhirEncounterHandler);
apiRouter.post("/api/webhooks/agendamento-criado", webhookAgendamentoCriadoHandler);

// Aplicar Middleware de Autenticação para todas as rotas de API subsequentes
apiRouter.use("/api", requireAuth);

// --- ROTAS DO MÓDULO PEDIÁTRICO ESPECIALIZADO ---
apiRouter.get("/api/pediatric/medications", getPediatricMedicationsHandler);
apiRouter.post("/api/pediatric/calculate-dose", calculateDoseHandler);
apiRouter.post("/api/pediatric/calculate-zscore", calculateZScoreHandler);
apiRouter.post("/api/pediatric/validate-vaccines", validateVaccinesHandler);
apiRouter.post("/api/pediatric/check-redflags", checkRedFlagsHandler);

import {
  getUserUsageHandler,
  upgradePlanHandler,
  listPlansHandler
} from "../controllers/usage.controller.js";
import {
  getPixContributionHandler,
  createPixOrderHandler,
  confirmPixPaymentHandler
} from "../controllers/pix.controller.js";
import {
  getStudentLibraryHandler,
  attachDocumentToChatHandler,
  generateQuizHandler
} from "../controllers/student-library.controller.js";

import { 
  inputSecurityMiddleware, 
  validateFeedbackInputMiddleware, 
  validateCouponInputMiddleware 
} from "../middleware/security-sanitizer.middleware.js";
import { 
  aiQueryLimiter, 
  feedbackLimiter, 
  couponLimiter 
} from "../middleware/rate-limiter.middleware.js";

// --- ROTAS DO MOTOR DE PLANOS, % DE USO E TOKENS (MEDIa v2.0) ---
apiRouter.get("/api/user/usage", getUserUsageHandler);
apiRouter.post("/api/plans/upgrade", couponLimiter, validateCouponInputMiddleware, upgradePlanHandler);
apiRouter.get("/api/plans", listPlansHandler);

// --- ROTAS DE CONTRIBUIÇÃO E ASSINATURA PIX ---
apiRouter.get("/api/pix/contribute", getPixContributionHandler);
apiRouter.post("/api/pix/order", createPixOrderHandler);
apiRouter.post("/api/pix/confirm", confirmPixPaymentHandler);

// --- ROTAS DA BIBLIOTECA ESTUDANTIL & QUIZ GENERATOR ---
apiRouter.get("/api/student/library", getStudentLibraryHandler);
apiRouter.post("/api/student/attach-to-chat", attachDocumentToChatHandler);
apiRouter.post("/api/student/generate-quiz", generateQuizHandler);

// --- ROTAS DA FILA DO DIA DO MÉDICO & ANAMNESE PRÉVIA ---
apiRouter.get("/api/worklist", getDoctorWorklistHandler);
apiRouter.post("/api/worklist/create-session", createPreAnamneseSessionHandler);
apiRouter.get("/api/worklist/:id", getAnamneseDetailsHandler);

// Endpoint principal do Agentic RAG Multiagente (suporta texto e/ou upload de imagem)
apiRouter.post("/api/query", aiQueryLimiter, queryImageUpload.single("image"), inputSecurityMiddleware, handleQuery);

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

// Feedback do Médico & Relato de Bugs
apiRouter.post("/api/feedback", feedbackLimiter, validateFeedbackInputMiddleware, handleSaveFeedback);

// --- ROTAS DE CONFORMIDADE LGPD & PRIVACY BY DESIGN (LEI 13.709/2018) ---
// 1. Prova e Gestão de Consentimento do Titular (Art. 7º e 8º)
apiRouter.post("/api/lgpd/consent", LgpdController.recordConsent);
apiRouter.get("/api/lgpd/consent/:identifier", LgpdController.getConsentStatus);

// 2. Direitos do Titular (DSAR - Data Subject Access Requests - Art. 18)
apiRouter.get("/api/lgpd/export/:sessionId", LgpdController.exportSubjectData); // Portabilidade e Acesso
apiRouter.delete("/api/lgpd/purge/:sessionId", LgpdController.purgeSubjectData); // Direito ao Esquecimento / Expurgo

// 3. Busca Segura por Blind Index (HMAC-SHA256)
apiRouter.post("/api/lgpd/search", LgpdController.searchByBlindIndex);

// Endpoints da Base de Conhecimento
apiRouter.get("/api/documents", handleListDocuments);
apiRouter.post("/api/documents/upload", upload.single("file"), handleUploadDocument);
apiRouter.delete("/api/documents/:id", handleDeleteDocument);
