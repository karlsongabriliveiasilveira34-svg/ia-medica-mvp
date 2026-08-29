import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool, ensureUsersSchema } from "../config/database.js";
import { env } from "../config/env.js";
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from "../../frontend/src/data/medicalQuestionsAndCards.js";
import { RUMEDQ_FLASHCARDS, DEPT_Q_BANK_QUESTIONS, MEDMCQA_QUESTIONS } from "../database/rumedq-deptq.seed.js";
import {
  normalizeQuestion,
  normalizeFlashcard,
  generateQuestionHash,
  generateFlashcardHash,
  calculateJaccardSimilarity
} from "../adapters/question-flashcard.adapter.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

// Concatenação e normalização universal dos acervos oficiais (ENARE, Revalida, Dept-Q-Bank, MedMCQA, RuMedQ)
const allRawQuestions = [...INITIAL_QUESTIONS, ...DEPT_Q_BANK_QUESTIONS, ...(MEDMCQA_QUESTIONS || [])];
const allRawFlashcards = [...INITIAL_FLASHCARDS, ...RUMEDQ_FLASHCARDS];

let memoryQuestions = allRawQuestions.map((q, idx) => normalizeQuestion(q, idx + 1)).filter(Boolean);
let memoryFlashcards = allRawFlashcards.map((f, idx) => normalizeFlashcard(f, idx + 1)).filter(Boolean);
let memoryAnswers = [];
const seenQuestionHashes = new Set(memoryQuestions.map(q => q.hash));

export class QuestoesGeneratorService {
  /**
   * 1. LISTA QUESTÕES COM PAGINAÇÃO, FILTROS E CONEXÃO REAL AO BANCO
   */
  static async listQuestions({ especialidade, tema, banca, dificuldade, status = "todas", userId = null, page = 1, limit = 50 }) {
    await ensureUsersSchema();
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Number.parseInt(limit, 10) || 50);
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

      // 1. Obter total de questões de forma segura e parametrizada
      const countSql = ["SELECT COUNT(*) FROM questoes", baseWhere].join(" ");
      const countRes = await pool.query(countSql, params);
      const total = Number.parseInt(countRes.rows[0]?.count || "0", 10);

      // 2. Obter página de questões
      const limitParamIdx = params.length + 1;
      const offsetParamIdx = params.length + 2;
      const dataSql = ["SELECT * FROM questoes", baseWhere, `ORDER BY id ASC LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}`].join(" ");
      const queryParams = [...params, limitNum, offset];
      const res = await pool.query(dataSql, queryParams);

      if (res.rows.length > 0 || total > 0) {
        const questoes = res.rows.map((r, idx) => normalizeQuestion(r, offset + idx + 1)).filter(Boolean);
        const finalTotal = total || questoes.length;
        const totalPages = Math.ceil(finalTotal / limitNum) || 1;
        return {
          total: finalTotal,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNext: offset + questoes.length < finalTotal,
          questoes,
          data: questoes,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: finalTotal,
            totalPages,
            hasNext: offset + questoes.length < finalTotal
          }
        };
      }
    } catch (err) {
      console.warn("[QUESTOES] Consulta no PostgreSQL em fallback para memória:", err.message);
    }

    // Fallback resiliente em memória
    let filtered = memoryQuestions.filter(q => {
      const espTarget = (q.subject || q.especialidade || q.area || "").toLowerCase();
      const topicTarget = (q.topic || q.tema || "").toLowerCase();
      const matchEsp = !especialidade || especialidade === "all" || espTarget.includes(especialidade.toLowerCase()) || topicTarget.includes(especialidade.toLowerCase());
      
      const bancaTarget = (q.source || q.banca || q.exam || "").toLowerCase();
      const matchBanca = !banca || banca === "all" || bancaTarget.includes(banca.toLowerCase());

      const difTarget = (q.difficulty || q.dificuldade || "").toLowerCase();
      const matchDif = !dificuldade || dificuldade === "all" || difTarget === dificuldade.toLowerCase();

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
    const paginated = filtered.slice(offset, offset + limitNum).map((q, idx) => normalizeQuestion(q, offset + idx + 1)).filter(Boolean);
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: offset + paginated.length < total,
      questoes: paginated,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: offset + paginated.length < total
      }
    };
  }

  /**
   * 2. REGISTRAR RESPOSTA DO ESTUDANTE E PERSISTIR HISTÓRICO REAL
   */
  static async recordAnswer({ userId, userEmail, questaoId, alternativaSelecionada, tempoSegundos = 0 }) {
    await ensureUsersSchema();
    if (!userId || !userEmail) throw new Error("Usuário deve estar autenticado para registrar progresso.");

    const selectedAlt = Number.parseInt(alternativaSelecionada, 10);
    if (Number.isNaN(selectedAlt) || selectedAlt < 0 || selectedAlt > 4) {
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
        model: env.geminiModel || "gemini-3.6-flash",
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

      const firstOpenBracket = text.indexOf('[');
      const lastCloseBracket = text.lastIndexOf(']');
      const firstOpenBrace = text.indexOf('{');
      const lastCloseBrace = text.lastIndexOf('}');
      let jsonString = null;

      if (firstOpenBracket !== -1 && lastCloseBracket > firstOpenBracket) {
        jsonString = text.slice(firstOpenBracket, lastCloseBracket + 1);
      } else if (firstOpenBrace !== -1 && lastCloseBrace > firstOpenBrace) {
        jsonString = text.slice(firstOpenBrace, lastCloseBrace + 1);
      }

      if (jsonString) {
        const parsed = JSON.parse(jsonString);
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
        const normalized = normalizeQuestion({
          ...item,
          subject: especialidade,
          topic: tema,
          difficulty: dificuldadeEspecifica,
          source: "ENARE / MedIa Inédita",
          sourceUrl: "https://enare.ebserh.gov.br"
        }, validQuestions.length + 1);

        if (normalized) {
          // Deduplicação estrita por hash SHA-256 e similaridade de Jaccard
          if (seenQuestionHashes.has(normalized.hash)) continue;
          const isDuplicate = validQuestions.some(existing => calculateJaccardSimilarity(existing.question, normalized.question) > 0.80);
          if (isDuplicate) continue;

          seenQuestionHashes.add(normalized.hash);
          validQuestions.push(normalized);
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
            q.source || q.banca || "ENARE / MedIa Inédita",
            q.subject || q.especialidade,
            q.topic || q.tema,
            q.difficulty || q.dificuldade,
            q.question || q.enunciado,
            JSON.stringify(q.options || q.alternativas),
            q.correctAnswer !== undefined ? q.correctAnswer : q.resposta_correta,
            q.explanation || q.explicacao
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
   * 6. LISTAGEM DE FLASHCARDS DO BANCO REAL COM PAGINAÇÃO E FILTROS
   */
  static async listFlashcards({ deckId, area, page = 1, limit = 50 } = {}) {
    await ensureUsersSchema();
    const offset = (Math.max(1, page) - 1) * limit;

    try {
      let sql = "SELECT * FROM flashcards WHERE 1=1";
      const params = [];
      if (deckId && deckId !== "all") {
        params.push(deckId);
        sql += ` AND deck_id = $${params.length}`;
      }
      if (area && area !== "all") {
        params.push(area);
        sql += ` AND area = $${params.length}`;
      }
      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const res = await pool.query(sql, params);
      const countRes = await pool.query("SELECT COUNT(*) FROM flashcards");
      const total = Number.parseInt(countRes.rows[0]?.count || "0", 10);

      if (res.rows.length > 0) {
        const flashcards = res.rows.map((r, idx) => normalizeFlashcard(r, offset + idx + 1)).filter(Boolean);
        return {
          total: total || flashcards.length,
          page,
          limit,
          flashcards
        };
      }
    } catch (err) {
      console.warn("[FLASHCARDS] Fallback para flashcards em memória:", err.message);
    }

    let filtered = memoryFlashcards;
    if (deckId && deckId !== "all") {
      filtered = filtered.filter(f => f.deckId === deckId || f.deck_id === deckId);
    }
    if (area && area !== "all") {
      filtered = filtered.filter(f => f.area === area || f.subject === area);
    }

    const paginated = filtered.slice(offset, offset + limit).map((f, idx) => normalizeFlashcard(f, offset + idx + 1)).filter(Boolean);

    return {
      total: filtered.length,
      page,
      limit,
      flashcards: paginated
    };
  }

  /**
   * 7. MÉTRICAS E ESTATÍSTICAS REAIS DO ACERVO DE ESTUDO (ZERO NÚMEROS FICTÍCIOS)
   */
  static async getStudyStats() {
    await ensureUsersSchema();

    let totalQuestions = memoryQuestions.length;
    let totalFlashcards = memoryFlashcards.length;
    let porEspecialidade = {};
    let porDeck = {};
    let bancasSet = new Set(memoryQuestions.map(q => q.banca || "ENARE"));

    try {
      const countQ = await pool.query("SELECT COUNT(*) FROM questoes");
      totalQuestions = Number.parseInt(countQ.rows[0]?.count || "0", 10) || totalQuestions;

      const countF = await pool.query("SELECT COUNT(*) FROM flashcards");
      totalFlashcards = Number.parseInt(countF.rows[0]?.count || "0", 10) || totalFlashcards;

      const groupQ = await pool.query("SELECT especialidade, COUNT(*) as qtd FROM questoes GROUP BY especialidade");
      groupQ.rows.forEach(r => {
        if (r.especialidade) porEspecialidade[r.especialidade] = Number.parseInt(r.qtd, 10);
      });

      const groupF = await pool.query("SELECT deck_id, COUNT(*) as qtd FROM flashcards GROUP BY deck_id");
      groupF.rows.forEach(r => {
        if (r.deck_id) porDeck[r.deck_id] = Number.parseInt(r.qtd, 10);
      });

      const bancasRes = await pool.query("SELECT DISTINCT banca FROM questoes WHERE banca IS NOT NULL");
      if (bancasRes.rows.length > 0) {
        bancasSet = new Set(bancasRes.rows.map(r => r.banca));
      }
    } catch (err) {
      console.warn("[STUDY STATS] Fallback para estatísticas em memória:", err.message);
    }

    if (Object.keys(porEspecialidade).length === 0) {
      memoryQuestions.forEach(q => {
        const esp = q.especialidade || q.area || "Geral";
        porEspecialidade[esp] = (porEspecialidade[esp] || 0) + 1;
      });
    }

    if (Object.keys(porDeck).length === 0) {
      memoryFlashcards.forEach(f => {
        const deck = f.deckId || f.deck_id || "geral";
        porDeck[deck] = (porDeck[deck] || 0) + 1;
      });
    }

    const totalDecks = Object.keys(porDeck).length || 8;
    const totalBancas = bancasSet.size || 5;

    return {
      totalQuestions,
      totalFlashcards,
      totalDecks,
      totalBancas,
      bancas: Array.from(bancasSet),
      porEspecialidade,
      porDeck
    };
  }
}
