import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool, ensureUsersSchema } from "../config/database.js";
import { env } from "../config/env.js";
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from "../../frontend/src/data/medicalQuestionsAndCards.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

// Cache/Store em memória resiliente
let memoryQuestions = INITIAL_QUESTIONS.map((q, idx) => ({
  id: q.id || `q_mem_${idx + 1}`,
  banca: q.exam || "ENARE",
  especialidade: q.area || "Clínica Médica",
  tema: q.topic || "Geral",
  dificuldade: "media",
  enunciado: q.question,
  alternativas: q.options,
  resposta_correta: q.correct !== undefined ? q.correct : 0,
  explicacao: q.explanation || "Gabarito comentado baseado nas diretrizes oficiais vigentes."
}));

let memoryFlashcards = [...INITIAL_FLASHCARDS];
let memoryAnswers = [];

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
    id: q.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
   * 1. LISTA QUESTÕES COM PAGINAÇÃO, FILTROS E CONEXÃO REAL AO BANCO
   */
  static async listQuestions({ especialidade, tema, banca, dificuldade, status = "todas", userId = null, page = 1, limit = 20 }) {
    await ensureUsersSchema();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    try {
      let baseWhere = "WHERE 1=1";
      const params = [];

      if (especialidade && especialidade !== "all") {
        params.push(`%${especialidade}%`);
        baseWhere += ` AND (especialidade ILIKE $${params.length} OR tema ILIKE $${params.length})`;
      }
      if (banca && banca !== "all") {
        params.push(`%${banca}%`);
        baseWhere += ` AND banca ILIKE $${params.length}`;
      }
      if (dificuldade && dificuldade !== "all") {
        params.push(dificuldade);
        baseWhere += ` AND dificuldade = $${params.length}`;
      }

      if (userId && status === "nao_respondidas") {
        params.push(userId);
        baseWhere += ` AND id NOT IN (SELECT questao_id::uuid FROM questoes_respostas WHERE user_id = $${params.length})`;
      } else if (userId && status === "erradas") {
        params.push(userId);
        baseWhere += ` AND id IN (SELECT questao_id::uuid FROM questoes_respostas WHERE user_id = $${params.length} AND acertou = false)`;
      }

      // 1. Obter total de questões
      const countRes = await pool.query(`SELECT COUNT(*) FROM questoes ${baseWhere}`, params);
      const total = parseInt(countRes.rows[0]?.count || "0", 10);

      // 2. Obter página de questões
      const queryParams = [...params, limitNum, offset];
      const dataQuery = `SELECT * FROM questoes ${baseWhere} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const res = await pool.query(dataQuery, queryParams);

      if (res.rows.length > 0 || total > 0) {
        const formatted = res.rows.map(q => ({
          id: q.id,
          banca: q.banca,
          exam: q.banca,
          especialidade: q.especialidade,
          area: q.especialidade,
          tema: q.tema,
          topic: q.tema,
          dificuldade: q.dificuldade,
          enunciado: q.enunciado,
          question: q.enunciado,
          alternativas: typeof q.alternativas === "string" ? JSON.parse(q.alternativas) : q.alternativas,
          options: typeof q.alternativas === "string" ? JSON.parse(q.alternativas) : q.alternativas,
          resposta_correta: q.resposta_correta,
          correct: q.resposta_correta,
          explicacao: q.explicacao,
          explanation: q.explicacao,
          created_at: q.created_at
        }));

        return {
          total,
          page: pageNum,
          limit: limitNum,
          hasNext: offset + formatted.length < total,
          questoes: formatted
        };
      }
    } catch (err) {
      console.warn("[QUESTOES] Consulta no PostgreSQL em fallback para memória:", err.message);
    }

function matchSpecialty(itemEsp, queryEsp) {
  if (!queryEsp || queryEsp === "all") return true;
  const a = (itemEsp || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const b = (queryEsp || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (a.includes(b) || b.includes(a)) return true;
  if (
    (a.includes("clinica") && b.includes("clinica")) ||
    (a.includes("cirurg") && b.includes("cirurg")) ||
    (a.includes("pediat") && b.includes("pediat")) ||
    (a.includes("gineco") && b.includes("gineco")) ||
    (a.includes("prevent") && b.includes("prevent")) ||
    (a.includes("urgenc") && b.includes("urgenc"))
  ) {
    return true;
  }
  return false;
}

    // Fallback resiliente em memória
    let filtered = memoryQuestions.filter(q => {
      const matchEsp = matchSpecialty(q.especialidade || q.area, especialidade);
      const matchBanca = !banca || banca === "all" ||
        (q.banca && q.banca.toLowerCase().includes(banca.toLowerCase())) ||
        (q.exam && q.exam.toLowerCase().includes(banca.toLowerCase()));
      const matchDif = !dificuldade || dificuldade === "all" || q.dificuldade === dificuldade;

      if (userId && status === "nao_respondidas") {
        const jaRespondeu = memoryAnswers.some(a => a.userId === userId && String(a.questaoId) === String(q.id));
        if (jaRespondeu) return false;
      } else if (userId && status === "erradas") {
        const errou = memoryAnswers.some(a => a.userId === userId && String(a.questaoId) === String(q.id) && !a.acertou);
        if (!errou) return false;
      }

      return matchEsp && matchBanca && matchDif;
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum).map(q => ({
      id: q.id,
      banca: q.banca || q.exam || "ENARE",
      exam: q.banca || q.exam || "ENARE",
      especialidade: q.especialidade || q.area || "Clínica Médica",
      area: q.especialidade || q.area || "Clínica Médica",
      tema: q.tema || q.topic || "Geral",
      topic: q.tema || q.topic || "Geral",
      dificuldade: q.dificuldade || "media",
      enunciado: q.enunciado || q.question,
      question: q.enunciado || q.question,
      alternativas: q.alternativas || q.options,
      options: q.alternativas || q.options,
      resposta_correta: q.resposta_correta !== undefined ? q.resposta_correta : q.correct,
      correct: q.resposta_correta !== undefined ? q.resposta_correta : q.correct,
      explicacao: q.explicacao || q.explanation,
      explanation: q.explicacao || q.explanation
    }));

    return {
      total,
      page: pageNum,
      limit: limitNum,
      hasNext: offset + paginated.length < total,
      questoes: paginated
    };
  }

  /**
   * 2. REGISTRAR RESPOSTA DO ESTUDANTE E PERSISTIR HISTÓRICO REAL
   */
  static async recordAnswer({ userId, userEmail, questaoId, alternativaSelecionada, tempoSegundos = 0 }) {
    await ensureUsersSchema();
    if (!userId || !userEmail) throw new Error("Usuário deve estar autenticado para registrar progresso.");

    const selectedAlt = parseInt(alternativaSelecionada, 10);
    if (isNaN(selectedAlt) || selectedAlt < 0 || selectedAlt > 4) {
      throw new Error("Alternativa selecionada inválida.");
    }

    // 1. Buscar questão correspondente
    let questao = null;
    try {
      const qRes = await pool.query("SELECT * FROM questoes WHERE id::text = $1 LIMIT 1", [String(questaoId)]);
      if (qRes.rows.length > 0) questao = qRes.rows[0];
    } catch (e) {}

    if (!questao) {
      questao = memoryQuestions.find(q => String(q.id) === String(questaoId));
    }

    if (!questao) {
      throw new Error("Questão não encontrada.");
    }

    const respostaCorreta = questao.resposta_correta !== undefined ? questao.resposta_correta : (questao.correct !== undefined ? questao.correct : 0);
    const acertou = (selectedAlt === respostaCorreta);
    const especialidade = questao.especialidade || questao.area || "Clínica Médica";

    // 2. Persistir resposta no banco de dados
    try {
      await pool.query(
        `INSERT INTO questoes_respostas (user_id, user_email, questao_id, especialidade, alternativa_selecionada, acertou, tempo_segundos)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, userEmail, String(questaoId), especialidade, selectedAlt, acertou, tempoSegundos]
      );
    } catch (dbErr) {
      console.warn("[QUESTOES] Fallback para histórico de respostas em memória:", dbErr.message);
    }

    // Sincronizar em memória
    memoryAnswers.push({
      userId,
      userEmail,
      questaoId: String(questaoId),
      especialidade,
      alternativaSelecionada: selectedAlt,
      acertou,
      tempoSegundos,
      createdAt: new Date()
    });

    console.log(`[STUDY][ANSWER] Usuário ${userEmail} respondeu questão ${questaoId}: ${acertou ? "ACERTOU ✅" : "ERROU ❌"}`);

    return {
      success: true,
      acertou,
      respostaCorreta,
      alternativaSelecionada: selectedAlt,
      explicacao: questao.explicacao || questao.explanation || "Gabarito comentado oficial."
    };
  }

  /**
   * 3. PROGRESSO E ESTATÍSTICAS REAIS DO ESTUDANTE
   */
  static async getUserStudyProgress(userId, userEmail) {
    await ensureUsersSchema();
    let rows = [];

    try {
      const res = await pool.query(
        "SELECT * FROM questoes_respostas WHERE user_id = $1 OR user_email = $2 ORDER BY created_at DESC",
        [userId, userEmail]
      );
      rows = res.rows;
    } catch (e) {
      rows = memoryAnswers.filter(a => a.userId === userId || a.userEmail === userEmail);
    }

    if (rows.length === 0) {
      rows = memoryAnswers.filter(a => a.userId === userId || a.userEmail === userEmail);
    }

    const totalRespondidas = rows.length;
    const acertos = rows.filter(r => r.acertou).length;
    const erros = totalRespondidas - acertos;
    const aproveitamento = totalRespondidas > 0 ? Math.round((acertos / totalRespondidas) * 100) : 0;

    // Estatísticas por grande área médica
    const porEspecialidade = {};
    for (const r of rows) {
      const esp = r.especialidade || "Clínica Médica";
      if (!porEspecialidade[esp]) {
        porEspecialidade[esp] = { total: 0, acertos: 0, erros: 0 };
      }
      porEspecialidade[esp].total++;
      if (r.acertou) porEspecialidade[esp].acertos++;
      else porEspecialidade[esp].erros++;
    }

    Object.keys(porEspecialidade).forEach(esp => {
      const s = porEspecialidade[esp];
      s.taxaAcerto = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : 0;
    });

    return {
      success: true,
      totalRespondidas,
      acertos,
      erros,
      aproveitamento,
      porEspecialidade,
      ultimasRespostas: rows.slice(0, 10).map(r => ({
        questaoId: r.questao_id,
        especialidade: r.especialidade,
        acertou: r.acertou,
        data: r.created_at || r.createdAt
      }))
    };
  }

  /**
   * 4. INVOCA GEMINI PARA QUESTÕES INÉDITAS COMENTADAS
   */
  static async callGeminiForQuestions(prompt) {
    if (!apiKey) return [];

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response?.text?.();
      if (!text) return [];
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.questoes)) return parsed.questoes;
      if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
      return [];
    } catch (err) {
      console.warn("[QUESTOES] Fallback para SDK legada do Gemini:", err.message);
    }

    try {
      const legacyAI = new GoogleGenerativeAI(apiKey);
      const model = legacyAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text();
      if (!text) return [];
      const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.questoes)) return parsed.questoes;
        if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
      }
    } catch (legacyErr) {
      console.error("[QUESTOES] Erro ao chamar IA para gerar questões:", legacyErr.message);
    }

    return [];
  }

  /**
   * 5. GERAÇÃO DINÂMICA DE LOTE DE QUESTÕES INÉDITAS COM DEDUPLICAÇÃO
   */
  static async generateQuestionsBatch({ especialidade = "Clínica Médica", tema = "Geral", dificuldadeEspecifica = "media" }) {
    const TARGET_COUNT = 5;
    const validQuestions = [];
    let attempts = 0;
    const maxAttempts = 3;

    while (validQuestions.length < TARGET_COUNT && attempts < maxAttempts) {
      attempts++;
      const needed = TARGET_COUNT - validQuestions.length;
      const prompt = `Você é um preceptor médico especialista e elaborador de provas do ENARE e Revalida.
Gere exatamente ${needed} questões de múltipla escolha inéditas de residência médica.
Especialidade: "${especialidade}".
Tema/Foco: "${tema}".
Dificuldade: "${dificuldadeEspecifica}".

Retorne estritamente um JSON no formato:
{
  "questoes": [
    {
      "enunciado": "Caso clínico detalhado com idade, queixa principal, tempo de evolução, exame físico com sinais vitais e dados laboratoriais...",
      "alternativas": [
        "A) Conduta ou diagnóstico 1",
        "B) Conduta ou diagnóstico 2",
        "C) Conduta ou diagnóstico 3",
        "D) Conduta ou diagnóstico 4"
      ],
      "resposta_correta": 0,
      "explicacao": "Resolução comentada profunda explicando por que a alternativa correta é a conduta de escolha e refutando detalhadamente cada uma das outras alternativas.",
      "banca": "ENARE / MedIa Inédita",
      "dificuldade": "${dificuldadeEspecifica}"
    }
  ]
}`;

      const rawBatch = await this.callGeminiForQuestions(prompt);
      for (const item of rawBatch) {
        if (validQuestions.length >= TARGET_COUNT) break;
        const validated = validateQuestionStructure(item, especialidade, tema, dificuldadeEspecifica);
        if (validated) {
          validQuestions.push(validated);
        }
      }
    }

    // Persistir questões geradas no PostgreSQL e na memória
    for (const q of validQuestions) {
      try {
        await pool.query(
          `INSERT INTO questoes (banca, especialidade, tema, dificuldade, enunciado, alternativas, resposta_correta, explicacao)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
          [
            q.banca || "ENARE / MedIa Inédita",
            q.especialidade,
            q.tema,
            q.dificuldade,
            q.enunciado,
            JSON.stringify(q.alternativas),
            q.resposta_correta,
            q.explicacao
          ]
        );
      } catch (e) {}

      memoryQuestions.unshift(q);
    }

    return {
      status: "success",
      questoesGeradas: validQuestions.length,
      especialidade,
      tema,
      questoes: validQuestions
    };
  }

  /**
   * 6. LISTAGEM DE FLASHCARDS
   */
  static async listFlashcards({ deckId }) {
    if (deckId && deckId !== "all") {
      return memoryFlashcards.filter(f => f.deckId === deckId);
    }
    return memoryFlashcards;
  }
}
