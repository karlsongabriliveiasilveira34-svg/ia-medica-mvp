import { GoogleGenAI } from "@google/genai";

/**
 * Biblioteca Estudantil Integrada & Gerador de Quizzes Médicos (MedIa v2.0)
 */

export const STUDENT_LIBRARY_CATALOG = [
  // Livros de Referência
  {
    id: "harrison_medicina_interna",
    category: "Livros Recomendados",
    title: "Harrison — Medicina Interna (21ª Edição)",
    authors: "Loscalzo, Fauci, Kasper, Hauser, Longo, Jameson",
    specialty: "Clínica Médica Geral",
    pages: 4200,
    tags: ["Fisiopatologia", "Diagnóstico Diferencial", "Clínica Geral"],
    summary: "A maior referência mundial em raciocínio clínico, diagnóstico e condutas em Medicina Interna.",
    excerpt: "A anamnese rigorosa e o exame físico detalhado constituem a pedra fundamental do método clínico. A interpretação de sintomas sistêmicos como febre de origem obscura exige correlação com dados laboratoriais e epidemiologia regional."
  },
  {
    id: "robbins_patologia",
    category: "Livros Recomendados",
    title: "Robbins & Cotran — Patologia: Bases Patológicas das Doenças (10ª Edição)",
    authors: "Kumar, Abbas, Aster",
    specialty: "Patologia & Fisiopatologia",
    pages: 1400,
    tags: ["Inflamação", "Imunopatologia", "Neoplasias"],
    summary: "Estudo dos mecanismos celulares, inflamatórios e moleculares que fundamentam os sinais e sintomas clínicos.",
    excerpt: "A resposta inflamatória aguda caracteriza-se por alterações vasculares que levam ao aumento do fluxo sanguíneo (rubor e calor) e aumento da permeabilidade capilar (edema), mediada por citocinas como TNF e IL-1."
  },
  {
    id: "gray_anatomia",
    category: "Livros Recomendados",
    title: "Gray's Anatomia para Estudantes (4ª Edição)",
    authors: "Drake, Vogl, Mitchell",
    specialty: "Anatomia Humana",
    pages: 1200,
    tags: ["Anatomia Clínica", "Topografia", "Semiologia"],
    summary: "Correlação anatômica direta com a prática médica, propedêutica e exames de imagem.",
    excerpt: "A anatomia da caixa torácica e a projeção dos focos auscultatórios cardíacos (aórtico, pulmonar, tricúspide e mitral) são essenciais para a detecção precoce de sopros e valvulopatias."
  },
  {
    id: "guyton_fisiologia",
    category: "Livros Recomendados",
    title: "Guyton & Hall — Tratado de Fisiologia Médica (14ª Edição)",
    authors: "Hall, Hall",
    specialty: "Fisiologia Humana",
    pages: 1150,
    tags: ["Homeostase", "Hemodinâmica", "Nefrologia"],
    summary: "Fundamentos dos sistemas de controle corporal, regulação hemodinâmica, renal e endócrina.",
    excerpt: "O sistema renina-angiotensina-aldosterona (SRAA) atua na manutenção da pressão arterial a longo prazo através do controle do volume de líquido extracelular e vasoconstrição arteriolar."
  },

  // Guidelines por Especialidade
  {
    id: "guideline_aha_hipertensao_2024",
    category: "Guidelines por Especialidade",
    title: "Diretriz Brasileira de Hipertensão Arterial (SBC/SBH 2024)",
    authors: "Sociedade Brasileira de Cardiologia",
    specialty: "Cardiologia",
    pages: 180,
    tags: ["Hipertensão", "Estratificação de Risco", "Anti-hipertensivos"],
    summary: "Classificação da PA, metas terapêuticas, escolha da combinação inicial de fármacos (IECA/BRA + BCC ou Diurético).",
    excerpt: "Em pacientes com hipertensão estágio 2 ou estágio 1 com alto risco cardiovascular, recomenda-se iniciar o tratamento farmacológico com a combinação de duas classes em doses baixas."
  },
  {
    id: "guideline_ms_arboviroses_2024",
    category: "Protocolos Brasileiros (Ministério da Saúde)",
    title: "Dengue, Chikungunya e Zika: Diagnóstico e Manejo Clínico (6ª Edição)",
    authors: "Ministério da Saúde do Brasil / SVS",
    specialty: "Infectologia & Atenção Primária",
    pages: 96,
    tags: ["Dengue", "Chikungunya", "Hidratação", "Sinais de Alarme"],
    summary: "Classificação em Grupos A, B, C e D, reposição volêmica oral vs parenteral e acompanhamento hematológico.",
    excerpt: "A identificação precoce dos sinais de alarme (dor abdominal intensa e contínua, vômitos persistentes, hipotensão postural e sangramento de mucosa) define a necessidade imediata de hidratação venosa vigorosa."
  },
  {
    id: "protocolo_sbp_curvas_crescimento",
    category: "Protocolos Brasileiros (Ministério da Saúde)",
    title: "Manual de Avaliação Nutricional e Crescimento da Criança (SBP/OMS)",
    authors: "Sociedade Brasileira de Pediatria",
    specialty: "Pediatria",
    pages: 120,
    tags: ["Pediatria", "Escore-Z", "Percentis", "Desenvolvimento"],
    summary: "Guia prático para cálculo de índices antropométricos e interpretação dos gráficos de escore-z na infância.",
    excerpt: "A vigilância do crescimento deve ocorrer em todas as consultas de puericultura, utilizando o escore-z para identificar tanto o risco de desnutrição quanto a sobrecarga ponderal precoce."
  },

  // Escalas e Calculadoras Médicas
  {
    id: "escala_curb65_pac",
    category: "Escalas Clínicas & Calculadoras",
    title: "Escore CURB-65 para Estratificação de Gravidade na Pneumonia Adquirida na Comunidade",
    authors: "British Thoracic Society (BTS)",
    specialty: "Pneumologia & Emergência",
    pages: 12,
    tags: ["Pneumonia", "CURB-65", "Indicação de Internação"],
    summary: "Critérios: Confusão mental, Ureia > 50 mg/dL, Respiração >= 30 rpm, Pressão arterial sistólica < 90 ou diastólica <= 60, Idade >= 65 anos.",
    excerpt: "Pacientes com escore CURB-65 de 0 a 1 apresentam baixo risco de mortalidade e podem ser tratados em regime ambulatorial com amoxicilina ou macrolídeo."
  }
];

class StudentLibraryService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.ai = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
  }

  /**
   * Retorna o catálogo completo da biblioteca médica estudantil
   */
  getCatalog(categoryFilter = null, specialtyFilter = null) {
    let items = STUDENT_LIBRARY_CATALOG;

    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }
    if (specialtyFilter) {
      items = items.filter((item) => item.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));
    }

    return items;
  }

  /**
   * Obtém documento específico para anexar à conversa do RAG
   */
  getDocumentForChat(documentId) {
    const doc = STUDENT_LIBRARY_CATALOG.find((d) => d.id === documentId);
    if (!doc) {
      throw new Error(`Documento "${documentId}" não encontrado na biblioteca.`);
    }

    return {
      id: doc.id,
      title: doc.title,
      authors: doc.authors,
      specialty: doc.specialty,
      excerpt: doc.excerpt,
      promptContext: `[DOCUMENTO ANEXADO DA BIBLIOTECA ESTUDANTIL: ${doc.title} (${doc.authors})]\nTrecho: "${doc.excerpt}"`
    };
  }

  /**
   * Gera automaticamente um Quiz de Aprendizagem de 3 a 5 perguntas
   * baseado na conversa clínica ou em um tópico médico
   */
  async generateClinicalQuiz({ topic = "Clínica Médica", conversationSummary = "" }) {
    // Se não houver API key ou erro de rede, gera quiz baseado em templates de alta qualidade
    const defaultQuizzes = [
      {
        question: `Em relação ao manejo inicial de arboviroses (Dengue e Chikungunya), qual a conduta prioritária na presença de sinais de alarme?`,
        options: [
          "Prescrição imediata de anti-inflamatórios não esteroidais (AINEs) para alívio da artralgia.",
          "Início imediato de hidratação venosa vigorosa (fase de expansão) e dosagem de hematócrito.",
          "Alta ambulatorial com retorno apenas se houver sangramento espontâneo.",
          "Administração profilática de antibióticos de amplo espectro."
        ],
        correctOptionIndex: 1,
        explanation: "A presença de sinais de alarme indica extravasamento plasmático e risco iminente de choque, sendo mandatória a hidratação parenteral imediata conforme as Diretrizes do Ministério da Saúde (2024).",
        referenceSource: "Diretrizes Nacionais para Prevenção e Controle de Dengue (MS)"
      },
      {
        question: `Na estratificação de risco da Pneumonia Adquirida na Comunidade (PAC) pelo escore CURB-65, qual paciente tem indicação de tratamento ambulatorial seguro?`,
        options: [
          "Paciente de 70 anos, lúcido, FR 22 rpm, PA 130/80 mmHg, Ureia normal (Escore 1).",
          "Paciente de 45 anos, confuso, FR 34 rpm, PA 80/50 mmHg (Escore 3).",
          "Paciente de 55 anos com hipotensão refratária e necessidade de vasopressor.",
          "Paciente de 62 anos com Ureia de 90 mg/dL e FR 32 rpm (Escore 2)."
        ],
        correctOptionIndex: 0,
        explanation: "Pacientes com escore CURB-65 igual a 0 ou 1 apresentam mortalidade inferior a 1.5% e podem ser conduzidos com segurança em ambiente ambulatorial com antibiótico oral.",
        referenceSource: "British Thoracic Society / Diretriz Brasileira de PAC"
      },
      {
        question: `No cálculo posológico da Amoxicilina para Otite Média Aguda em pediatria, qual a dose preconizada em cenários de risco de pneumococo resistente?`,
        options: [
          "20 a 30 mg/kg/dia divididos em 4 tomadas.",
          "50 mg/kg/dia em dose única diária.",
          "80 a 90 mg/kg/dia divididos a cada 8 ou 12 horas.",
          "150 mg/kg/dia com limite irrestrito."
        ],
        correctOptionIndex: 2,
        explanation: "Para superar cepas de Streptococcus pneumoniae com sensibilidade intermediária à penicilina, a Sociedade Brasileira de Pediatria recomenda doses otimizadas de 80-90 mg/kg/dia.",
        referenceSource: "Manual de Otorrinolaringologia Pediátrica (SBP)"
      }
    ];

    if (!this.ai) {
      return {
        topic,
        questionsCount: defaultQuizzes.length,
        questions: defaultQuizzes
      };
    }

    try {
      const prompt = `Você é um preceptor médico elaborando um Quiz de Fixação para estudantes de medicina sobre o tema "${topic}".
Resumo do caso discutido: "${conversationSummary}".
Elabore 3 perguntas de múltipla escolha com 4 alternativas cada.
O retorno DEVE ser um array JSON de objetos no seguinte formato:
[
  {
    "question": "Texto claro da pergunta clínica",
    "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    "correctOptionIndex": 0, // índice de 0 a 3
    "explanation": "Justificativa fisiopatológica e clínica detalhada",
    "referenceSource": "Diretriz ou livro de referência"
  }
]`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text);
      return {
        topic,
        questionsCount: parsed.length,
        questions: parsed
      };
    } catch (err) {
      console.warn("Fallback para quiz padrão:", err);
      return {
        topic,
        questionsCount: defaultQuizzes.length,
        questions: defaultQuizzes
      };
    }
  }
}

export const studentLibraryService = new StudentLibraryService();
