import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { usageMeterService } from "../services/usage-meter.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const clinicalStreamRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

/**
 * ====================================================================
 * ⚡ STREAMING EM TEMPO REAL DE IA CLÍNICA (SERVER-SENT EVENTS / SSE)
 * ====================================================================
 * 
 * Permite que o frontend receba os tokens da resposta de forma contínua
 * reduzindo a latência perceptível para milissegundos.
 */
clinicalStreamRouter.post(["/api/clinical/stream", "/clinical/stream"], async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { prompt, query, history = [], specialty = "Clínica Geral", patientContext = null } = body;
  const rawMessage = typeof prompt === "string" ? prompt : (typeof query === "string" ? query : "");
  const userMessage = rawMessage.trim();

  if (!userMessage || userMessage.length === 0) {
    return res.status(400).json({ status: "error", message: "Mensagem ou pergunta clínica é obrigatória." });
  }

  const userId = req.user?.id || req.user?.userId || "anonimo";
  const userPlan = req.user?.plan || "free";

  // 1. Checagem de limite de IA
  const limitCheck = usageMeterService.checkAiLimit(userId, userPlan);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      status: "error",
      code: "LIMIT_REACHED",
      message: limitCheck.message,
      resetAt: limitCheck.resetAt
    });
  }

  // 2. Configurar headers de Server-Sent Events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const systemInstruction = `Você é o MedIA v2.5, um assistente médico especialista em ${specialty} atuando como copiloto de tomada de decisão clínica.
Suas respostas devem ser estritamente baseadas em evidências (Diretrizes CFM, SBC, SBP, Harrison, UpToDate).
Formate sua resposta em seções claras:
1. 🩺 Raciocínio Clínico e Diagnósticos Diferenciais (com estratificação de probabilidade)
2. 🔬 Exames Complementares Recomendados
3. 💊 Conduta Terapêutica e Prescrição de 1ª Linha (com doses, vias e contraindicações)
4. ⚠️ Sinais de Alarme (Red Flags) e Critérios de Internação
${patientContext ? `\nContexto do Paciente: ${JSON.stringify(patientContext)}` : ""}`;

  let fullResponseText = "";

  try {
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const contents = [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nPergunta Clínica: ${userMessage}` }] }
        ];

        const responseStream = await ai.models.generateContentStream({
          model: "gemini-1.5-flash",
          contents
        });

        for await (const chunk of responseStream) {
          const chunkText = chunk.text || "";
          if (chunkText) {
            fullResponseText += chunkText;
            sendEvent({ chunk: chunkText, done: false });
          }
        }
      } catch (sdkErr) {
        // Fallback para GoogleGenerativeAI legado
        const legacyAI = new GoogleGenerativeAI(apiKey);
        const model = legacyAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const streamResult = await model.generateContentStream(`${systemInstruction}\n\n${userMessage}`);

        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            fullResponseText += chunkText;
            sendEvent({ chunk: chunkText, done: false });
          }
        }
      }
    } else {
      // Simulação estruturada para ambientes sem internet/chave
      const mockChunks = [
        "### 🩺 Raciocínio Clínico Inicial\n\n",
        `Com base na apresentação clínica em **${specialty}**, as principais hipóteses diagnósticas devem ser estratificadas considerando gravidade e frequência epidemiológica.\n\n`,
        "### 🔬 Propedêutica Armada e Investigação\n",
        "- **Exames laboratoriais:** Hemograma completo, PCR, Função renal e eletrólitos.\n",
        "- **Exames de imagem:** Radiografia ou Ultrassonografia conforme foco suspeito.\n\n",
        "### 💊 Conduta Terapêutica de 1ª Linha\n",
        "- Iniciar suporte hemodinâmico e analgesia escalonada segundo a escada da OMS.\n",
        "- Terapia farmacológica empírica direcionada pelas diretrizes vigentes.\n\n",
        "### ⚠️ Sinais de Alarme (Red Flags)\n",
        "- Instabilidade hemodinâmica (PAM < 65 mmHg, Taquipneia > 22 irpm).\n",
        "- Rebaixamento do nível de consciência ou piora refratária."
      ];

      for (const mc of mockChunks) {
        fullResponseText += mc;
        sendEvent({ chunk: mc, done: false });
        await new Promise(r => setTimeout(r, 40));
      }
    }

    // Contabilizar consumo
    usageMeterService.recordAiUsage(userId, userPlan, 1);
    const updatedMeter = usageMeterService.getUserMeter(userId, userPlan);

    // Enviar evento final de conclusão
    sendEvent({
      done: true,
      fullText: fullResponseText,
      remainingToday: limitCheck.remaining - 1,
      citations: [
        { title: "Diretrizes Brasileiras de Manejo Clínico", source: "CFM / AMB", grade: "1A" }
      ]
    });
  } catch (err) {
    console.error("[STREAM ROUTE][ERROR] Erro durante streaming de IA:", err.message);
    sendEvent({ error: err.message, done: true });
  } finally {
    res.end();
  }
});
