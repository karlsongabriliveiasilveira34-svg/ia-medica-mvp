import crypto from "crypto";

/**
 * ====================================================================
 * 🩺 ADAPTER & NORMALIZADOR DE QUESTÕES E FLASHCARDS MÉDICOS (MedIa v2.5)
 * ====================================================================
 * 
 * Centraliza o padrão de dados, garantindo que fontes externas, banco de dados
 * PostgreSQL e stores em memória conversem na mesma interface uniforme.
 */

/**
 * Normaliza uma string preservando caracteres alfanuméricos globais (Unicode) e stop-words
 */
export function normalizeTextForComparison(text) {
  if (!text || typeof text !== "string") return "";
  const stopWords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "para", "com", "sem", "sobre", "qual",
    "quais", "como", "onde", "quando", "porque", "por que", "que", "se", "ou", "e"
  ]);

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(word => word.length >= 1 && !stopWords.has(word))
    .join(" ");
}

/**
 * Gera um Fingerprint SHA-256 único determinístico para uma questão médica
 */
export function generateQuestionHash(q) {
  const enunciado = q.question || q.enunciado || "";
  const normalized = normalizeTextForComparison(enunciado);
  const subject = (q.subject || q.especialidade || q.area || "Geral").toLowerCase().trim();
  return crypto.createHash("sha256").update(`${subject}::${normalized}`).digest("hex");
}

/**
 * Gera um Fingerprint SHA-256 determinístico para um flashcard
 */
export function generateFlashcardHash(card) {
  const front = normalizeTextForComparison(card.front || card.frente || "");
  const back = normalizeTextForComparison(card.back || card.verso || "");
  const deck = (card.deckId || card.deck_id || "geral").toLowerCase().trim();
  return crypto.createHash("sha256").update(`${deck}::${front}::${back}`).digest("hex");
}

/**
 * Calcula a similaridade de Jaccard entre dois textos (0.0 a 1.0)
 */
export function calculateJaccardSimilarity(textA, textB) {
  const tokensA = new Set(normalizeTextForComparison(textA).split(" "));
  const tokensB = new Set(normalizeTextForComparison(textB).split(" "));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Normaliza e padroniza qualquer objeto de questão (banco, IA ou API externa)
 */
export function normalizeQuestion(raw, fallbackIndex = 1) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id !== undefined && raw.id !== null ? String(raw.id) : `q_${fallbackIndex}_${Date.now()}`;
  const question = (raw.question || raw.enunciado || "").trim();
  if (!question || question.length < 15) return null;

  let rawOptions = Array.isArray(raw.options) ? raw.options : (Array.isArray(raw.alternativas) ? raw.alternativas : []);
  if (!rawOptions || rawOptions.length < 4) return null;

  const options = rawOptions.slice(0, 4).map((opt, idx) => {
    const str = String(opt || "").trim();
    const prefix = String.fromCharCode(65 + idx) + ") ";
    return str.startsWith(prefix) ? str : `${prefix}${str}`;
  });

  let correctAnswer = raw.correctAnswer !== undefined ? raw.correctAnswer : (raw.resposta_correta !== undefined ? raw.resposta_correta : (raw.correct !== undefined ? raw.correct : 0));
  if (typeof correctAnswer === "string") {
    const matchIdx = options.findIndex(opt => opt.toLowerCase().includes(correctAnswer.toLowerCase()));
    correctAnswer = matchIdx >= 0 ? matchIdx : 0;
  } else {
    correctAnswer = parseInt(correctAnswer, 10);
    if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
      correctAnswer = 0;
    }
  }

  const explanation = (raw.explanation || raw.explicacao || "Gabarito comentado baseado nas diretrizes oficiais vigentes.").trim();
  const subject = (raw.subject || raw.especialidade || raw.area || "Clínica Médica").trim();
  const topic = (raw.topic || raw.tema || "Caso Clínico").trim();
  const difficulty = (raw.difficulty || raw.dificuldade || "media").toLowerCase().trim();
  const source = (raw.source || raw.banca || raw.exam || "ENARE").trim();
  const sourceUrl = (raw.sourceUrl || "https://enare.ebserh.gov.br").trim();
  const language = raw.language || "pt-BR";
  const hash = raw.hash || generateQuestionHash({ question, subject });
  const createdAt = raw.createdAt || raw.created_at || new Date().toISOString();
  const updatedAt = raw.updatedAt || raw.updated_at || new Date().toISOString();

  return {
    id,
    question,
    options,
    correctAnswer,
    explanation,
    subject,
    topic,
    difficulty,
    source,
    sourceUrl,
    language,
    hash,
    createdAt,
    updatedAt,
    
    // Propriedades legadas para retrocompatibilidade
    enunciado: question,
    alternativas: options,
    resposta_correta: correctAnswer,
    explicacao: explanation,
    especialidade: subject,
    tema: topic,
    dificuldade: difficulty,
    banca: source
  };
}

/**
 * Normaliza e padroniza qualquer objeto de flashcard
 */
export function normalizeFlashcard(raw, fallbackIndex = 1) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id !== undefined && raw.id !== null ? String(raw.id) : `card_${fallbackIndex}_${Date.now()}`;
  const front = (raw.front || raw.frente || "").trim();
  const back = (raw.back || raw.verso || "").trim();
  if (!front || !back) return null;

  const deckId = (raw.deckId || raw.deck_id || "geral").toLowerCase().trim();
  const subject = (raw.subject || raw.especialidade || raw.area || "Clínica Médica").trim();
  const topic = (raw.topic || raw.tema || "Revisão Espaçada").trim();
  const difficulty = (raw.difficulty || raw.dificuldade || "media").toLowerCase().trim();
  const source = (raw.source || "Diretrizes Oficiais (MS/SBC/SBP)").trim();
  const sourceUrl = (raw.sourceUrl || "https://publicacoes.cardiol.br").trim();
  const language = raw.language || "pt-BR";
  const hash = raw.hash || generateFlashcardHash({ front, back, deckId });
  const createdAt = raw.createdAt || raw.created_at || new Date().toISOString();
  const updatedAt = raw.updatedAt || raw.updated_at || new Date().toISOString();

  return {
    id,
    front,
    back,
    deckId,
    subject,
    topic,
    difficulty,
    source,
    sourceUrl,
    language,
    hash,
    createdAt,
    updatedAt,

    // Propriedades legadas
    frente: front,
    verso: back,
    deck_id: deckId,
    especialidade: subject,
    tema: topic,
    dificuldade: difficulty
  };
}
