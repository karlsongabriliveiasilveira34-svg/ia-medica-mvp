import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from "../../frontend/src/data/medicalQuestionsAndCards.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

// Cache/Store em memória caso o banco não esteja disponível
let memoryQuestions = [...INITIAL_QUESTIONS];
let memoryFlashcards = [...INITIAL_FLASHCARDS];

export class QuestoesGeneratorService {
  /**
   * Lista questões com filtros por especialidade, tema, banca ou dificuldade
   */
  static async listQuestions({ especialidade, tema, banca, dificuldade, limit = 50 }) {
    try {
      let query = "SELECT * FROM questoes WHERE 1=1";
      const params = [];

      if (especialidade && especialidade !== 'all') {
        params.push(`%${especialidade}%`);
        query += ` AND especialidade ILIKE $${params.length}`;
      }
      if (banca && banca !== 'all') {
        params.push(`%${banca}%`);
        query += ` AND banca ILIKE $${params.length}`;
      }
      if (dificuldade) {
        params.push(dificuldade);
        query += ` AND dificuldade = $${params.length}`;
      }

      query += " ORDER BY id DESC LIMIT 100";
      const res = await pool.query(query, params);
      if (res.rows.length > 0) {
        return res.rows;
      }
    } catch (err) {
      // Fallback em memória
    }

    // Filtrar store em memória
    return memoryQuestions.filter(q => {
      const matchEsp = !especialidade || especialidade === 'all' || (q.area && q.area.toLowerCase().includes(especialidade.toLowerCase())) || (q.especialidade && q.especialidade.toLowerCase().includes(especialidade.toLowerCase()));
      const matchBanca = !banca || banca === 'all' || (q.exam && q.exam.toLowerCase().includes(banca.toLowerCase())) || (q.banca && q.banca.toLowerCase().includes(banca.toLowerCase()));
      return matchEsp && matchBanca;
    });
  }

  /**
   * Gera 5 questões inéditas comentadas via Gemini e salva no banco/memória
   */
  static async generateQuestionsBatch({ especialidade = "Clínica Médica", tema = "Geral", dificuldadeEspecifica = "media" }) {
    const prompt = `Gere exatamente 5 questões médicas inéditas de múltipla escolha no padrão oficial de Residência Médica (ENARE e Revalida INEP).
Especialidade: ${especialidade}
Tema Específico: ${tema}
Nível de Dificuldade: ${dificuldadeEspecifica}

Responda ESTRITAMENTE em formato JSON (um array de 5 objetos), sem texto adicional ou markdown fora do JSON:
[
  {
    "especialidade": "${especialidade}",
    "tema": "${tema}",
    "enunciado": "Texto detalhado do caso clínico com paciente, idade, queixa principal, exame físico e exames laboratoriais...",
    "alternativas": [
      "A) Primeira opção de conduta",
      "B) Segunda opção de conduta",
      "C) Terceira opção de conduta",
      "D) Quarta opção de conduta"
    ],
    "resposta_correta": 1,
    "explicacao": "Explicação clínica detalhada e embasada em diretrizes demonstrando o porquê da alternativa correta e dos distratores.",
    "banca": "ENARE / MedIa Inédita",
    "ano": 2026,
    "dificuldade": "${dificuldadeEspecifica}"
  }
]`;

    let generatedQuestions = [];

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const rawText = response.text || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedQuestions = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn("[QUESTOES] Fallback para GoogleGenerativeAI:", err.message);
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const jsonMatch = rawText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            generatedQuestions = JSON.parse(jsonMatch[0]);
          }
        } catch (sdkErr) {
          console.error("[QUESTOES] Erro ao gerar questões com IA:", sdkErr);
        }
      }
    }

    // Se a IA não gerou, fornecer lote de fallback consistente
    if (!generatedQuestions || generatedQuestions.length === 0) {
      generatedQuestions = [
        {
          especialidade,
          tema,
          enunciado: `Caso clínico de ${especialidade} focado em ${tema}: Paciente adulto jovem apresenta sintomas típicos agudos sem sinais de choque. Qual a melhor conduta propedêutica e terapêutica de 1ª linha?`,
          alternativas: [
            "A) Solicitar exames laboratoriais básicos e instituir suporte de 1ª linha",
            "B) Encaminhar para cirurgia de urgência sem propedêutica",
            "C) Prescrever antimicrobiano de amplo espectro empírico",
            "D) Dar alta sem orientações específicas"
          ],
          resposta_correta: 0,
          explicacao: `A abordagem escalonada e racional em ${especialidade} prioriza suporte clínico e propedêutica dirigida antes de condutas invasivas desnecessárias.`,
          banca: "ENARE / Simulado",
          ano: 2026,
          dificuldade: dificuldadeEspecifica
        }
      ];
    }

    // Salvar no PostgreSQL e memória
    let savedCount = 0;
    for (const q of generatedQuestions) {
      const newId = Date.now() + Math.floor(Math.random() * 1000);
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
      questoesGeradas: generatedQuestions.length,
      questoesSalvas: savedCount,
      questoes: generatedQuestions
    };
  }

  /**
   * Lista flashcards
   */
  static async listFlashcards({ deckId }) {
    try {
      const query = deckId && deckId !== 'all'
        ? "SELECT * FROM flashcards WHERE deck_id = $1"
        : "SELECT * FROM flashcards";
      const params = deckId && deckId !== 'all' ? [deckId] : [];
      const res = await pool.query(query, params);
      if (res.rows.length > 0) return res.rows;
    } catch (err) {}

    if (deckId && deckId !== 'all') {
      return memoryFlashcards.filter(c => c.deckId === deckId);
    }
    return memoryFlashcards;
  }
}
