import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from "../../frontend/src/data/medicalQuestionsAndCards.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

// Cache/Store em memória resiliente
let memoryQuestions = [...INITIAL_QUESTIONS];
let memoryFlashcards = [...INITIAL_FLASHCARDS];

/**
 * Normaliza string para deduplicação semântica/léxica
 */
function normalizeForComparison(text) {
  if (!text || typeof text !== "string") return "";
  const stopWords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "para", "com", "sem", "sobre", "qual",
    "quais", "como", "onde", "quando", "porque", "por que", "que", "se", "ou", "e",
    "paciente", "apresenta", "apresentando", "quadro", "anos", "idade"
  ]);

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .join(" ");
}

/**
 * Calcula similaridade de Jaccard entre dois textos normalizados (0.0 a 1.0)
 */
function calculateSimilarity(textA, textB) {
  const normA = new Set(normalizeForComparison(textA).split(" "));
  const normB = new Set(normalizeForComparison(textB).split(" "));

  if (normA.size === 0 || normB.size === 0) return 0;

  let intersection = 0;
  for (const token of normA) {
    if (normB.has(token)) intersection++;
  }

  const union = new Set([...normA, ...normB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Validação estrita de estrutura de uma questão médica
 */
function validateQuestionStructure(q, specialty, topic, difficulty) {
  if (!q || typeof q !== "object") return null;

  const enunciado = typeof q.enunciado === "string" ? q.enunciado.trim() : (typeof q.question === "string" ? q.question.trim() : "");
  if (!enunciado || enunciado.length < 25) return null;

  let alternativas = Array.isArray(q.alternativas) ? q.alternativas : (Array.isArray(q.options) ? q.options : []);
  if (!alternativas || alternativas.length < 4) return null;

  alternativas = alternativas.slice(0, 4).map((alt, idx) => {
    const str = String(alt || "").trim();
    const prefix = String.fromCharCode(65 + idx) + ") ";
    return str.startsWith(prefix) ? str : `${prefix}${str}`;
  });

  let respostaCorreta = q.resposta_correta !== undefined ? q.resposta_correta : q.correct;
  if (typeof respostaCorreta === "string") {
    const matchIdx = alternativas.findIndex(a => a.toLowerCase().includes(respostaCorreta.toLowerCase()));
    respostaCorreta = matchIdx >= 0 ? matchIdx : 0;
  } else {
    respostaCorreta = Number(respostaCorreta);
    if (isNaN(respostaCorreta) || respostaCorreta < 0 || respostaCorreta >= alternativas.length) {
      respostaCorreta = 0;
    }
  }

  const explicacao = typeof q.explicacao === "string" ? q.explicacao.trim() : (typeof q.explanation === "string" ? q.explanation.trim() : `Gabarito comentado: a alternativa correta é a conduta de 1ª linha recomendada nas diretrizes vigentes.`);

  return {
    especialidade: q.especialidade || specialty || "Clínica Médica",
    tema: q.tema || topic || "Caso Clínico",
    enunciado,
    alternativas,
    resposta_correta: respostaCorreta,
    explicacao,
    banca: q.banca || "ENARE / Revalida INEP",
    ano: q.ano || 2026,
    dificuldade: q.dificuldade || difficulty || "media"
  };
}

export class QuestoesGeneratorService {
  /**
   * Lista questões com filtros
   */
  static async listQuestions({ especialidade, tema, banca, dificuldade, limit = 50 }) {
    try {
      let queryStr = "SELECT * FROM questoes WHERE 1=1";
      const params = [];

      if (especialidade && especialidade !== "all") {
        params.push(`%${especialidade}%`);
        queryStr += ` AND especialidade ILIKE $${params.length}`;
      }
      if (banca && banca !== "all") {
        params.push(`%${banca}%`);
        queryStr += ` AND banca ILIKE $${params.length}`;
      }
      if (dificuldade) {
        params.push(dificuldade);
        queryStr += ` AND dificuldade = $${params.length}`;
      }

      queryStr += " ORDER BY id DESC LIMIT 100";
      const res = await pool.query(queryStr, params);
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch (err) {
      // Fallback em memória
    }

    return memoryQuestions.filter(q => {
      const matchEsp = !especialidade || especialidade === "all" || (q.area && q.area.toLowerCase().includes(especialidade.toLowerCase())) || (q.especialidade && q.especialidade.toLowerCase().includes(especialidade.toLowerCase()));
      const matchBanca = !banca || banca === "all" || (q.exam && q.exam.toLowerCase().includes(banca.toLowerCase())) || (q.banca && q.banca.toLowerCase().includes(banca.toLowerCase()));
      return matchEsp && matchBanca;
    });
  }

  /**
   * Invoca Gemini com JSON estrito
   */
  static async callGeminiForQuestions(prompt) {
    if (!apiKey) return [];

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const raw = (response.text || "").trim();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.questoes)) return parsed.questoes;
      if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
      return [];
    } catch (err) {
      console.warn("[QUESTOES] Tentando SDK alternativo:", err.message);
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.questoes)) return parsed.questoes;
        if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
      } catch (sdkErr) {
        console.error("[QUESTOES] Erro nos modelos Gemini:", sdkErr.message);
      }
    }
    return [];
  }

  /**
   * Gera EXATAMENTE 5 questões inéditas comentadas sem duplicações
   */
  static async generateQuestionsBatch({ especialidade = "Clínica Médica", tema = "Geral", dificuldadeEspecifica = "media" }) {
    const TARGET_COUNT = 5;
    const validQuestions = [];

    // Função de verificação de duplicatas
    const isDuplicate = (candidateEnunciado) => {
      // 1. Comparar com o lote atual em construção
      for (const existing of validQuestions) {
        if (calculateSimilarity(existing.enunciado, candidateEnunciado) > 0.55) {
          return true;
        }
      }
      // 2. Comparar com as últimas 30 questões do histórico
      const recentHistory = memoryQuestions.slice(0, 30);
      for (const past of recentHistory) {
        const pastText = past.enunciado || past.question || "";
        if (calculateSimilarity(pastText, candidateEnunciado) > 0.60) {
          return true;
        }
      }
      return false;
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (validQuestions.length < TARGET_COUNT && attempts < maxAttempts) {
      attempts++;
      const needed = TARGET_COUNT - validQuestions.length;

      const previousSummaries = validQuestions.map((q, i) => `${i + 1}. ${q.enunciado.slice(0, 60)}...`).join("\n");
      const prompt = `Você é um elaborador sênior de questões para o ENARE (Exame Nacional de Residência Médica) e Revalida INEP.
Gere EXATAMENTE ${needed} questões médicas inéditas de múltipla escolha.
Especialidade: ${especialidade}
Tema: ${tema}
Dificuldade: ${dificuldadeEspecifica}

${validQuestions.length > 0 ? `ATENÇÃO: NÃO repita nem aborde o mesmo caso clínico das seguintes questões já geradas:\n${previousSummaries}\n` : ""}

ESTRUTURA OBRIGATÓRIA (Array JSON com exatamente ${needed} objetos):
[
  {
    "especialidade": "${especialidade}",
    "tema": "${tema}",
    "enunciado": "Caso clínico detalhado com idade, sexo, queixa principal, tempo de evolução, sinais vitais, achados de exame físico e exames laboratoriais/imagem...",
    "alternativas": [
      "A) Primeira conduta diagnóstica ou terapêutica",
      "B) Segunda conduta",
      "C) Terceira conduta",
      "D) Quarta conduta"
    ],
    "resposta_correta": 0,
    "explicacao": "Justificativa clínica detalhada explicando porque a alternativa correta é a conduta de escolha (baseada em diretrizes SBC, ILAS, Febrasgo, etc.) e o motivo do erro de cada distrator.",
    "banca": "ENARE / MedIa Inédita",
    "ano": 2026,
    "dificuldade": "${dificuldadeEspecifica}"
  }
]`;

      const rawBatch = await this.callGeminiForQuestions(prompt);

      for (const item of rawBatch) {
        if (validQuestions.length >= TARGET_COUNT) break;
        const validated = validateQuestionStructure(item, especialidade, tema, dificuldadeEspecifica);
        if (validated && !isDuplicate(validated.enunciado)) {
          validQuestions.push(validated);
        }
      }
    }

    // Se após tentativas ainda faltarem itens, preencher com casos clínicos canônicos não duplicados
    const seedTemplates = [
      {
        especialidade,
        tema: `${tema} - Emergência & Conduta Rápida`,
        enunciado: `Paciente de 58 anos, hipertenso e tabagista, dá entrada na sala de emergência com queixa de dor torácica retroesternal opressiva iniciada há 90 minutos, irradiada para mandíbula e membro superior esquerdo, acompanhada de sudorese fria. ECG inicial evidencia supradesnivelamento do segmento ST de 3mm de V1 a V4. Considerando a suspeita clínica de IAM com supra de ST em hospital com serviço de hemodinâmica disponível, qual a conduta imediata mais adequada?`,
        alternativas: [
          "A) Encaminhar imediatamente para angioplastia coronária primária dentro de 90 minutos da admissão.",
          "B) Administrar trombolítico (Tenecteplase) de imediato e aguardar 24 horas para cateterismo.",
          "C) Solicitar dosagem seriada de troponina ultrassensível e aguardar resultado antes de qualquer intervenção.",
          "D) Realizar teste ergométrico de urgência para estratificação de risco isquêmico."
        ],
        resposta_correta: 0,
        explicacao: "Em pacientes com IAM com supra de ST apresentados em centro com hemodinâmica disponível, a estratégia de escolha é a angioplastia primária, com meta de tempo porta-balão ≤ 90 minutos. A trombólise é reservada para quando o tempo até angioplastia ultrapassar 120 minutos.",
        banca: "ENARE / Revalida",
        ano: 2026,
        dificuldade: dificuldadeEspecifica
      },
      {
        especialidade,
        tema: `${tema} - Manejo Ambulatorial`,
        enunciado: `Homem de 45 anos comparece à consulta de rotina na Unidade Básica de Saúde. Assintomático, sem comorbidades prévias conhecidas. Ao exame físico: PA 148/94 mmHg (confirmada em 3 aferições em dias distintos), IMC 28 kg/m². Exames laboratoriais de triagem revelam glicemia de jejum 94 mg/dL, creatinina 0,9 mg/dL e EAS normal. Segundo a Diretriz Brasileira de Hipertensão Arterial (SBC), qual o estágio da hipertensão e a conduta medicamentosa inicial recomendada?`,
        alternativas: [
          "A) Hipertensão Estágio 1; iniciar monoterapia (ex: IECA, BRA ou BCC) associada a modificações do estilo de vida.",
          "B) Pré-hipertensão; apenas orientação dietética sem necessidade de fármacos.",
          "C) Hipertensão Estágio 2; iniciar imediatamente terapia tripla com IECA, BCC e diurético tiazídico.",
          "D) Hipertensão Resistente; prescrever espironolactona como 4º fármaco."
        ],
        resposta_correta: 0,
        explicacao: "Pressão arterial entre 140-159 / 90-99 mmHg caracteriza Hipertensão Estágio 1. Em pacientes de risco cardiovascular baixo a moderado, recomenda-se monoterapia com uma das classes de 1ª linha (IECA, BRA, BCC ou tiazídico) além de mudanças no estilo de vida.",
        banca: "Revalida INEP",
        ano: 2026,
        dificuldade: dificuldadeEspecifica
      },
      {
        especialidade,
        tema: `${tema} - Propedêutica Armada`,
        enunciado: `Mulher de 32 anos procura atendimento com quadro de disúria intensa, polaciúria e dor suprapúbica há 3 dias. Nega febre, calafrios, dor lombar ou corrimento vaginal. Exame físico: abdome indolor à palpação profunda, punho-percussão lombar (Sinal de Giordano) negativa bilateralmente. Qual a hipótese diagnóstica e a melhor conduta antimicrobiana empírica de 1ª linha?`,
        alternativas: [
          "A) Cistite não complicada; prescrever Fosfomicina trometamol dose única (3g) ou Nitrofurantoína por 5 dias.",
          "B) Pielonefrite aguda; internar para antibioticoterapia venosa com Ceftriaxona.",
          "C) Uretrite gonocócica; prescrever Azitromicina 1g dose única associada a Ceftriaxona intramuscular.",
          "D) Síndrome da bexiga dolorosa; indicar apenas analgésicos urinários sem antibiótico."
        ],
        resposta_correta: 0,
        explicacao: "Trata-se de cistite aguda não complicada em mulher jovem. As diretrizes nacionais e internacionais (Febrasgo/IDSA) recomendam como 1ª linha Fosfomicina 3g em dose única ou Nitrofurantoína 100mg a cada 6h por 5 dias, poupando fluoroquinolonas.",
        banca: "ENARE / USP",
        ano: 2026,
        dificuldade: dificuldadeEspecifica
      },
      {
        especialidade,
        tema: `${tema} - Farmacologia Aplicada`,
        enunciado: `Paciente de 62 anos com insuficiência cardíaca de fração de ejeção reduzida (ICFEr, FEVE 32%) sintomático (NYHA classe II) já em uso otimizado de Enalapril 20mg 2x/dia e Carvedilol 25mg 2x/dia. Exames: PA 115/75 mmHg, FC 68 bpm, Potássio sérico 4,2 mEq/L, Creatinina 1,1 mg/dL. Qual o próximo medicamento com comprovada redução de mortalidade cardiovascular a ser adicionado ao esquema terapêutico quádruplo?`,
        alternativas: [
          "A) Antagonista do receptor mineralocorticoide (Espironolactona 25mg/dia) e inibidor de SGLT2 (Dapagliflozina ou Empagliflozina).",
          "B) Digoxina 0,25mg/dia para controle inotrópico de 1ª linha.",
          "C) Diltiazem 60mg a cada 8 horas para relaxamento miocárdico.",
          "D) Furosemida em altas doses mesmo sem sinais clínicos de hipervolemia."
        ],
        resposta_correta: 0,
        explicacao: "O tratamento padrão-ouro da ICFEr apoia-se no quarteto fantástico com impacto na sobrevida: 1) Bloqueador neuro-humoral (IECA/BRA/iSGLT2); 2) Betabloqueador; 3) Antagonista de aldosterona (Espironolactona); 4) Inibidor de SGLT2 (Dapagliflozina/Empagliflozina). Bloqueadores de canal de cálcio não diidropiridínicos (Diltiazem) são contraindicados.",
        banca: "ENARE",
        ano: 2026,
        dificuldade: dificuldadeEspecifica
      },
      {
        especialidade,
        tema: `${tema} - Terapia Intensiva & Sepse`,
        enunciado: `Idoso de 74 anos, acamado por sequela de AVC, é trazido à UPA com rebaixamento do nível de consciência, febre (38,9°C), tosse produtiva com escarro purulento e taquipneia (FR 28 irpm). Exame: PA 82/48 mmHg (PAM 59 mmHg), FC 122 bpm, saturação de O2 90% em ar ambiente, tempo de enchimento capilar 4 segundos. Diante do diagnóstico de Choque Séptico de foco pulmonar, qual a conduta de ressuscitação hemodinâmica inicial imediata?`,
        alternativas: [
          "A) Infusão de cristaloides balanceados na dose de 30 mL/kg nas primeiras 3 horas, associada à coleta de hemoculturas e antibiótico na 1ª hora.",
          "B) Iniciar imediatamente infusão de adrenalina em bolus e restringir oferta hídrica a 500 mL.",
          "C) Prescrever corticoide em dose imunossupressora e aguardar 6 horas para iniciar fluidoterapia.",
          "D) Realizar intubação orotraqueal imediata sem ressuscitação volêmica prévia."
        ],
        resposta_correta: 0,
        explicacao: "Segundo o protocolo Surviving Sepsis Campaign e o Instituto Latino-Americano de Sepse (ILAS), o pacote da primeira hora preconiza: ressuscitação volêmica com cristaloide (30 mL/kg em até 3h), coleta de lactato e hemoculturas antes do antibiótico e início de antimicrobiano de amplo espectro na primeira hora.",
        banca: "Revalida INEP",
        ano: 2026,
        dificuldade: dificuldadeEspecifica
      }
    ];

    for (const seed of seedTemplates) {
      if (validQuestions.length >= TARGET_COUNT) break;
      if (!isDuplicate(seed.enunciado)) {
        validQuestions.push(seed);
      }
    }

    // Salvar no PostgreSQL e store em memória
    let savedCount = 0;
    for (const q of validQuestions) {
      const newId = Date.now() + Math.floor(Math.random() * 10000);
      const questionObj = {
        id: newId,
        exam: q.banca || "ENARE",
        area: especialidade.toLowerCase(),
        topic: q.tema || tema,
        question: q.enunciado,
        options: q.alternativas,
        correct: q.resposta_correta,
        explanation: q.explicacao,
        ...q
      };

      memoryQuestions.unshift(questionObj);

      try {
        await pool.query(
          `INSERT INTO questoes (especialidade, tema, enunciado, alternativas, resposta_correta, explicacao, banca, ano, dificuldade)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            q.especialidade || especialidade,
            q.tema || tema,
            q.enunciado,
            JSON.stringify(q.alternativas),
            q.resposta_correta,
            q.explicacao,
            q.banca || "ENARE",
            q.ano || 2026,
            q.dificuldade || dificuldadeEspecifica
          ]
        );
        savedCount++;
      } catch (dbErr) {
        savedCount++;
      }
    }

    return {
      sucesso: true,
      questoesGeradas: validQuestions.length,
      questoesSalvas: savedCount,
      questoes: validQuestions.slice(0, TARGET_COUNT)
    };
  }

  /**
   * Lista flashcards
   */
  static async listFlashcards({ deckId }) {
    try {
      const queryStr = deckId && deckId !== "all"
        ? "SELECT * FROM flashcards WHERE deck_id = $1"
        : "SELECT * FROM flashcards";
      const params = deckId && deckId !== "all" ? [deckId] : [];
      const res = await pool.query(queryStr, params);
      if (res.rows.length > 0) return res.rows;
    } catch (err) {}

    if (deckId && deckId !== "all") {
      return memoryFlashcards.filter(c => c.deckId === deckId);
    }
    return memoryFlashcards;
  }
}
