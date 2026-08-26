/**
 * Motor de Planos, Medição de Tokens e Porcentagem de Uso Visual (MedIa v2.0)
 */

export const PLANS_CONFIG = {
  free: {
    id: "free",
    name: "Plano Free",
    badgeColor: "#10b981", // Emerald
    priceMonthly: 0,
    priceAnnual: 0,
    requestsLimit: 10, // 10 requisições de IA por mês
    flashcardsDailyLimit: 10, // 10 flashcards por dia
    questionsDailyLimit: 5, // 5 questões por dia
    tokensLimit: 4000,
    maxCharsPerMsg: 500,
    maxLinesPerMsg: 10,
    maxUploadsPerMonth: 0,
    maxDocSizeMb: 0,
    canDiagnose: false,
    canPrescribe: false,
    canUploadDocs: false,
    hasStudentLibrary: false,
    hasPediatrics: false,
    hasAudioScribe: false,
    hasExportPdf: false,
    hasMultiSpecialty: false,
    features: [
      "Busca em base SciELO + PubMed",
      "10 requisições de IA / mês",
      "10 flashcards / dia",
      "5 questões de simulado / dia"
    ],
    lockedFeatures: [
      "Diagnósticos diferenciais com cálculo probabilístico",
      "Upload de exames e PDFs",
      "Flashcards e questões ilimitadas",
      "Prescrições e calculadoras pediátricas"
    ]
  },
  estudante: {
    id: "estudante",
    name: "Plano Estudante",
    badgeColor: "#f59e0b", // Amber
    priceMonthly: 19.90,
    priceAnnual: 199.00,
    requestsLimit: 250,
    flashcardsDailyLimit: Infinity,
    questionsDailyLimit: Infinity,
    tokensLimit: 50000,
    maxCharsPerMsg: 2000,
    maxLinesPerMsg: 50,
    maxUploadsPerMonth: 10,
    maxDocSizeMb: 2,
    canDiagnose: false,
    canPrescribe: false,
    canUploadDocs: true,
    hasStudentLibrary: true,
    hasPediatrics: true,
    hasAudioScribe: true,
    hasExportPdf: false,
    hasMultiSpecialty: false,
    features: [
      "250 requisições de IA / mês (50.000 tokens)",
      "Flashcards ilimitados com repetição espaçada",
      "Banco de questões e simulados ilimitados",
      "Biblioteca médica e Quizzes automáticos",
      "Upload de até 10 documentos/mês (2MB cada)",
      "Histórico de conversas (30 dias)"
    ],
    lockedFeatures: [
      "Diagnóstico clínico conclusivo de médico",
      "Prescrições farmacológicas automáticas",
      "Laudos com exportação em PDF"
    ]
  },
  clinica: {
    id: "clinica",
    name: "Plano Clínica",
    badgeColor: "#8b5cf6", // Purple
    priceMonthly: 79.90,
    priceAnnual: 799.00,
    requestsLimit: 1000,
    flashcardsDailyLimit: Infinity,
    questionsDailyLimit: Infinity,
    tokensLimit: 200000,
    maxCharsPerMsg: 5000,
    maxLinesPerMsg: 200,
    maxUploadsPerMonth: 50,
    maxDocSizeMb: 50,
    canDiagnose: true,
    canPrescribe: false,
    canUploadDocs: true,
    hasStudentLibrary: true,
    hasPediatrics: true,
    hasAudioScribe: true,
    hasExportPdf: true,
    hasMultiSpecialty: true,
    features: [
      "1.000 requisições / mês (200.000 tokens)",
      "Até 5.000 caracteres por mensagem",
      "Diagnóstico diferencial baseado em evidências (%)",
      "Upload de até 50 documentos/mês (50MB cada)",
      "Geração de laudos estruturados e exportação PDF",
      "Fila do Dia com recepção e anamnese prévia"
    ],
    lockedFeatures: [
      "Prescrições avançadas com interações graves",
      "Análise multimodal de imagens radiológicas"
    ]
  },
  medico: {
    id: "medico",
    name: "Plano Médico (Premium)",
    badgeColor: "#e11d48", // Rose
    priceMonthly: 299.90,
    priceAnnual: 2999.00,
    requestsLimit: 5000,
    flashcardsDailyLimit: Infinity,
    questionsDailyLimit: Infinity,
    tokensLimit: 500000,
    maxCharsPerMsg: Infinity,
    maxLinesPerMsg: Infinity,
    maxUploadsPerMonth: 9999,
    maxDocSizeMb: 500,
    canDiagnose: true,
    canPrescribe: true,
    canUploadDocs: true,
    hasStudentLibrary: true,
    hasPediatrics: true,
    hasAudioScribe: true,
    hasExportPdf: true,
    hasMultiSpecialty: true,
    features: [
      "Mensagens e linhas ilimitadas (500.000 tokens/mês)",
      "Multi-especialidade com roteamento automático",
      "Análise de imagens médicas e fotos da câmera",
      "Geração de prescrições e posologias pediátricas",
      "Decisões clínicas críticas (UTI e Emergência)",
      "Uploads ilimitados de documentos (até 500MB)",
      "Interoperabilidade HL7 FHIR e Webhooks de ERPs",
      "Suporte prioritário 24/7"
    ],
    lockedFeatures: []
  }
};

class UsageMeterService {
  constructor() {
    this.userUsage = new Map();
  }

  getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  getCurrentMonthString() {
    return new Date().toISOString().slice(0, 7);
  }

  /**
   * Obtém ou inicializa o medidor de consumo do usuário com controle de datas
   */
  getUserMeter(userId, planId = "free") {
    const today = this.getTodayString();
    const currentMonth = this.getCurrentMonthString();

    if (!this.userUsage.has(userId)) {
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));

      this.userUsage.set(userId, {
        userId,
        planId,
        requestsUsed: 0,
        tokensUsed: 0,
        aiRequestsMonth: 0,
        flashcardsDay: 0,
        questionsDay: 0,
        uploadsUsed: 0,
        lastDailyDate: today,
        lastMonthlyDate: currentMonth,
        resetDate: resetDate.toLocaleDateString("pt-BR"),
        daysUntilReset: Math.max(1, daysUntilReset)
      });
    }

    const meter = this.userUsage.get(userId);
    meter.planId = planId;

    // Reset diário (Flashcards e Questões)
    if (meter.lastDailyDate !== today) {
      meter.flashcardsDay = 0;
      meter.questionsDay = 0;
      meter.lastDailyDate = today;
    }

    // Reset mensal (Requisições de IA e Tokens)
    if (meter.lastMonthlyDate !== currentMonth) {
      meter.aiRequestsMonth = 0;
      meter.requestsUsed = 0;
      meter.tokensUsed = 0;
      meter.lastMonthlyDate = currentMonth;
    }

    return meter;
  }

  /**
   * Valida se o usuário pode consumir um determinado recurso conforme seu plano
   */
  checkResourceLimit(userId, planId = "free", resource = "ai") {
    const plan = PLANS_CONFIG[planId] || PLANS_CONFIG.free;
    const meter = this.getUserMeter(userId, planId);

    if (resource === "ai") {
      const limit = plan.requestsLimit;
      const used = meter.aiRequestsMonth || meter.requestsUsed || 0;
      if (planId === "free" && used >= limit) {
        return {
          allowed: false,
          resource: "ai",
          limit,
          used,
          remaining: 0,
          resetAt: "no início do próximo mês",
          message: `Você atingiu o limite gratuito de ${limit} requisições de IA por mês. Seu saldo será renovado no próximo mês. Faça upgrade para o Plano Estudante para continuar utilizando sem interrupções.`
        };
      }
      return {
        allowed: true,
        resource: "ai",
        limit,
        used,
        remaining: Math.max(0, limit - used)
      };
    }

    if (resource === "flashcards") {
      const limit = plan.flashcardsDailyLimit || 10;
      const used = meter.flashcardsDay || 0;
      if (planId === "free" && used >= limit) {
        return {
          allowed: false,
          resource: "flashcards",
          limit,
          used,
          remaining: 0,
          resetAt: "amanhã às 00:00",
          message: `Você atingiu o limite gratuito diário de ${limit} flashcards. Seu saldo será renovado amanhã às 00:00. Faça upgrade para o Plano Estudante para flashcards ilimitados.`
        };
      }
      return {
        allowed: true,
        resource: "flashcards",
        limit,
        used,
        remaining: Math.max(0, limit - used)
      };
    }

    if (resource === "questions") {
      const limit = plan.questionsDailyLimit || 5;
      const used = meter.questionsDay || 0;
      if (planId === "free" && used >= limit) {
        return {
          allowed: false,
          resource: "questions",
          limit,
          used,
          remaining: 0,
          resetAt: "amanhã às 00:00",
          message: `Você atingiu o limite gratuito diário de ${limit} questões no simulado. Seu saldo será renovado amanhã às 00:00. Faça upgrade para o Plano Estudante para praticar sem limites.`
        };
      }
      return {
        allowed: true,
        resource: "questions",
        limit,
        used,
        remaining: Math.max(0, limit - used)
      };
    }

    return { allowed: true, limit: Infinity, used: 0, remaining: Infinity };
  }

  /**
   * Registra o consumo de um recurso específico
   */
  recordResourceUsage(userId, planId = "free", resource = "ai", amount = 1) {
    const meter = this.getUserMeter(userId, planId);
    if (resource === "ai") {
      meter.requestsUsed += amount;
      meter.aiRequestsMonth += amount;
      meter.tokensUsed += amount * 350;
    } else if (resource === "flashcards") {
      meter.flashcardsDay += amount;
    } else if (resource === "questions") {
      meter.questionsDay += amount;
    }
    return this.getUsageSummary(userId, planId);
  }

  /**
   * Registra o consumo de uma nova mensagem e tokens (Legado / Compatibilidade)
   */
  recordUsage(userId, planId = "free", estimatedTokens = 350) {
    return this.recordResourceUsage(userId, planId, "ai", 1);
  }

  /**
   * Gera o sumário completo com porcentagem, cor e permissões
   */
  getUsageSummary(userId, planId = "free") {
    const plan = PLANS_CONFIG[planId] || PLANS_CONFIG.free;
    const meter = this.getUserMeter(userId, planId);

    const requestsUsed = meter.requestsUsed;
    const requestsLimit = plan.requestsLimit;
    const requestsPercentage = Math.min(100, Number(((requestsUsed / requestsLimit) * 100).toFixed(1)));

    const tokensUsed = meter.tokensUsed;
    const tokensLimit = plan.tokensLimit;
    const tokensPercentage = Math.min(100, Number(((tokensUsed / tokensLimit) * 100).toFixed(1)));

    const highestPercentage = Math.max(requestsPercentage, tokensPercentage);
    let colorStatus = "green";
    let statusMessage = "Você está com saldo normal ✅";

    if (highestPercentage >= 100) {
      colorStatus = "blocked";
      statusMessage = "Limite mensal atingido! Upgrade necessário 🚫";
    } else if (highestPercentage >= 95) {
      colorStatus = "red";
      statusMessage = "Você está muito próximo do limite mensal! 🔴";
    } else if (highestPercentage >= 80) {
      colorStatus = "orange";
      statusMessage = "Atenção: 80% do limite mensal utilizado 🟠";
    } else if (highestPercentage >= 50) {
      colorStatus = "yellow";
      statusMessage = "Consumo moderado: acompanhe seu uso ⚠️";
    }

    const canMakeRequest = highestPercentage < 100 || planId === "medico";

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        badgeColor: plan.badgeColor,
        priceMonthly: plan.priceMonthly,
        priceAnnual: plan.priceAnnual,
        canDiagnose: plan.canDiagnose,
        canPrescribe: plan.canPrescribe,
        canUploadDocs: plan.canUploadDocs,
        hasStudentLibrary: plan.hasStudentLibrary,
        hasPediatrics: plan.hasPediatrics,
        hasAudioScribe: plan.hasAudioScribe,
        hasExportPdf: plan.hasExportPdf,
        hasMultiSpecialty: plan.hasMultiSpecialty,
        features: plan.features,
        lockedFeatures: plan.lockedFeatures
      },
      usage: {
        requestsUsed,
        requestsLimit,
        requestsPercentage,
        aiRequestsMonth: meter.aiRequestsMonth,
        flashcardsDay: meter.flashcardsDay,
        flashcardsDailyLimit: plan.flashcardsDailyLimit,
        questionsDay: meter.questionsDay,
        questionsDailyLimit: plan.questionsDailyLimit,
        tokensUsed,
        tokensLimit,
        tokensPercentage,
        highestPercentage,
        uploadsUsed: meter.uploadsUsed,
        uploadsLimit: plan.maxUploadsPerMonth,
        resetDate: meter.resetDate,
        daysUntilReset: meter.daysUntilReset
      },
      ui: {
        colorStatus,
        statusMessage,
        canMakeRequest
      }
    };
  }

  recordUpload(userId, planId = "free") {
    const meter = this.getUserMeter(userId, planId);
    meter.uploadsUsed += 1;
  }
}

export const usageMeterService = new UsageMeterService();
