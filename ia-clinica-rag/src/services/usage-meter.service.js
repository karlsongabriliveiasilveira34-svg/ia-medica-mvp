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
    requestsLimit: 5,
    tokensLimit: 2000,
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
      "5 mensagens / mês",
      "Consultas clínicas simples (até 500 caracteres)"
    ],
    lockedFeatures: [
      "Diagnósticos diferenciais com cálculo probabilístico",
      "Upload de exames e PDFs",
      "Biblioteca estudantil e Quizzes",
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
    tokensLimit: 50000,
    maxCharsPerMsg: 2000,
    maxLinesPerMsg: 50,
    maxUploadsPerMonth: 10,
    maxDocSizeMb: 2, // 2MB no v0.05
    canDiagnose: false, // Educativo / Fisiopatologia
    canPrescribe: false,
    canUploadDocs: true,
    hasStudentLibrary: true,
    hasPediatrics: true,
    hasAudioScribe: true,
    hasExportPdf: false,
    hasMultiSpecialty: false,
    features: [
      "250 requisições / mês (50.000 tokens)",
      "Até 2.000 caracteres por mensagem",
      "Biblioteca médica (Harrison, Robbins, Gray)",
      "Upload de até 10 documentos/mês (2MB cada)",
      "Gerador de Quiz automático de aprendizagem",
      "Histórico de conversas (30 dias)",
      "Fisiopatologia e raciocínio didático"
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
    tokensLimit: 200000,
    maxCharsPerMsg: 5000,
    maxLinesPerMsg: 200,
    maxUploadsPerMonth: 50,
    maxDocSizeMb: 50, // 50MB
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
      "Consenso científico dinâmico validado",
      "Fila do Dia com recepção e anamnese prévia",
      "Citações completas com links SciELO e PubMed"
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
    requestsLimit: 5000, // Ilimitado na prática
    tokensLimit: 500000,
    maxCharsPerMsg: Infinity,
    maxLinesPerMsg: Infinity,
    maxUploadsPerMonth: 9999,
    maxDocSizeMb: 500, // 500MB
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
    // Armazena o consumo de cada usuário no ciclo mensal atual
    this.userUsage = new Map();
  }

  /**
   * Obtém ou inicializa o medidor de consumo do usuário
   */
  getUserMeter(userId, planId = "free") {
    if (!this.userUsage.has(userId)) {
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));

      // Valores iniciais simulados para demonstração rica
      let initialRequests = 1;
      let initialTokens = 450;

      if (planId === "estudante") {
        initialRequests = 187;
        initialTokens = 38500;
      } else if (planId === "clinica") {
        initialRequests = 420;
        initialTokens = 84000;
      } else if (planId === "medico") {
        initialRequests = 1250;
        initialTokens = 180000;
      }

      this.userUsage.set(userId, {
        userId,
        planId,
        requestsUsed: initialRequests,
        tokensUsed: initialTokens,
        uploadsUsed: planId === "free" ? 0 : 3,
        resetDate: resetDate.toLocaleDateString("pt-BR"),
        daysUntilReset: Math.max(1, daysUntilReset)
      });
    }

    const meter = this.userUsage.get(userId);
    meter.planId = planId;
    return meter;
  }

  /**
   * Registra o consumo de uma nova mensagem e tokens
   */
  recordUsage(userId, planId = "free", estimatedTokens = 350) {
    const meter = this.getUserMeter(userId, planId);
    meter.requestsUsed += 1;
    meter.tokensUsed += estimatedTokens;
    return this.getUsageSummary(userId, planId);
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

    // Determinar o status de cor visual baseado na maior porcentagem
    const highestPercentage = Math.max(requestsPercentage, tokensPercentage);
    let colorStatus = "green"; // 'green', 'yellow', 'orange', 'red', 'blocked'
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

  /**
   * Registra um upload de documento
   */
  recordUpload(userId, planId = "free") {
    const meter = this.getUserMeter(userId, planId);
    meter.uploadsUsed += 1;
  }
}

export const usageMeterService = new UsageMeterService();
