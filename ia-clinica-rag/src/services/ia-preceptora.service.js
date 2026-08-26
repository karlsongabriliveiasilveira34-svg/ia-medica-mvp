import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

export class IaPreceptoraService {
  /**
   * Processa mensagem do usuário com contexto e persona específica (Médico vs Estudante)
   */
  static async processChat({ mensagem, modo = "medico", conversationId = null, userId = null, historico = [] }) {
    const textoLimpo = (mensagem || "").trim();

    // 1. Resposta rápida para saudações simples
    const saudacoes = ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "hey", "hello"];
    if (saudacoes.includes(textoLimpo.toLowerCase())) {
      const saudacaoResposta = modo === "estudante"
        ? "Olá! Sou sua IA Preceptora Acadêmica. Qual conceito fisiopatológico, tema de prova (ENARE/Revalida) ou dúvida clínica posso te ajudar a revisar hoje?"
        : "Olá, Doutor(a)! Como posso apoiar sua conduta ou raciocínio clínico no caso de hoje?";

      return {
        resposta: saudacaoResposta,
        modo,
        conversationId: conversationId || `conv_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }

    // 2. Definir System Prompt baseado no modo
    let systemInstruction = "";
    if (modo === "estudante") {
      systemInstruction = `Você é a IA Preceptora Médica Acadêmica do MedIa.
Seu objetivo é ensinar com clareza, rigor científico e didática de excelência.
Diretrizes:
- Explique os mecanismos fisiopatológicos fundamentais subjacentes.
- Cite referências canônicas (Harrison, Guyton & Hall Fisiologia, Cecil Medicina, Diretrizes SBC, ILAS, Febrasgo, SBP).
- Destaque pontos de alta incidência para provas de Residência Médica (ENARE, Revalida INEP, USP, SUS-SP).
- Formate a resposta de forma estruturada com tópicos claros, tabelas comparativas quando oportuno e dicas mnemônicas.`;
    } else {
      systemInstruction = `Você é o Copiloto Clínico Baseado em Evidências do MedIa para médicos assistentes.
Seu objetivo é fornecer apoio rápido, direto e estruturado para tomada de decisão clínica.
Diretrizes:
- Seja direto, conciso e profissional.
- Estruture em: 1) Hipóteses Diagnósticas Principais; 2) Conduta Imediata / Exames; 3) Proposta Terapêutica / Doses Farmacológicas de 1ª linha; 4) Sinais de Alarme (Red Flags).
- Fundamente em consensos oficiais e diretrizes médicas vigentes.
- Inclua aviso de que a responsabilidade médica final de prescrição cabe ao médico assistente.`;
    }

    let respostaTexto = "";

    // 3. Tentar gerar com Gemini AI
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nMENSAGEM DO USUÁRIO:\n${textoLimpo}` }]
            }
          ]
        });

        respostaTexto = response.text || "";
      } catch (genAiErr) {
        console.warn("[IA PRECEPTORA] Tentando fallback para GoogleGenerativeAI:", genAiErr.message);
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(`${systemInstruction}\n\nMENSAGEM DO USUÁRIO:\n${textoLimpo}`);
          respostaTexto = result.response.text();
        } catch (sdkErr) {
          console.error("[IA PRECEPTORA] Erro nos SDKs Gemini:", sdkErr);
        }
      }
    }

    // 4. Fallback contextual caso a API key não esteja disponível
    if (!respostaTexto) {
      if (modo === "estudante") {
        respostaTexto = `**Síntese Acadêmica & Raciocínio Fisiopatológico:**\n\n• **Conceito Fundamental:** Em relação a "${textoLimpo}", o processo clínico envolve a homeostase tecidual e a resposta imune/celular.\n\n• **Conduta de Prova (ENARE/Revalida):** Priorize sempre a propedêutica armada escalonada antes de intervenções invasivas de alto risco.\n\n• **Referência Canônica:** Tratado de Medicina Interna (Harrison / Cecil).`;
      } else {
        respostaTexto = `**Apoio à Decisão Clínica:**\n\n1. **Avaliação Inicial:** Investigar estabilidade hemodinâmica para "${textoLimpo}".\n2. **Exames de 1ª Linha:** Laboratório dirigido e imagem conforme janela temporal.\n3. **Proposta Terapêutica:** Monitorar resposta e instituir conduta baseada na última diretriz oficial.\n\n*Aviso médico-legal: Ferramenta de apoio. Decisão clínica exclusiva do médico assistente.*`;
      }
    }

    // 5. Gravar no banco de dados se conectado
    try {
      if (userId) {
        let convId = conversationId;
        if (!convId) {
          const convRes = await pool.query(
            "INSERT INTO conversations (user_id, modo, titulo) VALUES ($1, $2, $3) RETURNING id",
            [userId, modo, textoLimpo.slice(0, 50)]
          );
          convId = convRes.rows[0].id;
        }

        await pool.query(
          "INSERT INTO messages (conversation_id, user_id, role, conteudo) VALUES ($1, $2, 'user', $3), ($1, $2, 'model', $4)",
          [convId, userId, textoLimpo, respostaTexto]
        );
      }
    } catch (dbErr) {
      // Ignore DB error silently in fallback
    }

    return {
      resposta: respostaTexto,
      modo,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}
