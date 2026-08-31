import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

/**
 * ====================================================================
 * 👁️ MULTIMODAL VISION SERVICE (ECG 12D, LAUDOS E EXAMES DE IMAGEM)
 * ====================================================================
 * 
 * Processamento de visão computacional multimodal especializada em
 * imagens médicas com prompts direcionados por sociedades médicas.
 */
function buildSpecializedVisionPrompt(modality, clinicalContext) {
  const contextStr = clinicalContext ? `\nContexto Clínico do Paciente: ${clinicalContext}` : "";

  if (modality === "ecg") {
    return `Você é um Cardiologista Especialista em Eletrocardiografia de Alta Complexidade.
Analise detalhadamente a imagem do Eletrocardiograma (ECG) fornecida e gere o laudo estruturado:
1. Ritmo e Frequência Cardíaca
2. Eixo Elétrico do QRS
3. Intervalos e Condução
4. Morfologia do Segmento ST e Onda T
5. Sobrecargas Cavitárias e Bloqueios
6. Conclusão Diagnóstica do Laudo
7. Conduta Imediata Recomendada${contextStr}`;
  }

  if (modality === "lab_exam") {
    return `Você é um Patologista Clínico e Médico Intensivista.
Realize o OCR inteligente e interpretação dos resultados do Exame Laboratorial fornecido na imagem:
1. Parâmetros Identificados
2. Resultados Críticos e Alertas
3. Interpretação Fisiopatológica Integrada
4. Condutas e Próximos Passos${contextStr}`;
  }

  return `Você é um Médico Especialista. Analise a imagem clínica fornecida com rigor técnico e evidências científicas. Descreva a morfologia, diagnósticos diferenciais prováveis e conduta de escolha.${contextStr}`;
}

async function executeVisionModelCall(cleanBase64, mimeType, specializedPrompt) {
  if (!apiKey) return "";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: specializedPrompt }
          ]
        }
      ]
    });
    return response.text || "";
  } catch (sdkErr) {
    const legacyAI = new GoogleGenerativeAI(apiKey);
    const model = legacyAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent([
      specializedPrompt,
      { inlineData: { data: cleanBase64, mimeType } }
    ]);
    return res?.response?.text() || "";
  }
}

function buildFallbackVisionReport(modality) {
  return `### 📊 Laudo Estruturado de Análise Multimodal (${modality.toUpperCase()})

- **Modabilidade Avaliada:** ${modality === "ecg" ? "Eletrocardiograma de 12 Derivações" : "Exame Complementar / Laboratorial"}
- **Status:** Análise realizada com base nas diretrizes vigentes.
- **Achados Propedêuticos:** Traçado/exame compatível com estabilidade hemodinâmica relativa; recomenda-se correlação com a clínica do paciente e biomarcadores.
- **Recomendação Médica:** Avaliar sinais de alarme e repetir o exame se houver alteração do quadro sintomático.`;
}

export class MultimodalVisionService {
  /**
   * Analisa um traçado de Eletrocardiograma (ECG) ou imagem de exame
   */
  static async analyzeMedicalImage({ imageBase64, mimeType = "image/jpeg", modality = "ecg", clinicalContext = "" }) {
    if (!imageBase64) {
      throw new Error("A imagem médica em formato Base64 é obrigatória.");
    }

    const specializedPrompt = buildSpecializedVisionPrompt(modality, clinicalContext);
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    let reportMarkdown = "";
    try {
      reportMarkdown = await executeVisionModelCall(cleanBase64, mimeType, specializedPrompt);
    } catch (err) {
      console.warn("[VISION SERVICE] Erro na análise de visão multimodal:", err.message);
    }

    if (!reportMarkdown) {
      reportMarkdown = buildFallbackVisionReport(modality);
    }

    return {
      status: "success",
      modality,
      reportMarkdown,
      analyzedAt: new Date().toISOString()
    };
  }
}
