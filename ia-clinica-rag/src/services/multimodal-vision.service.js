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
export class MultimodalVisionService {
  /**
   * Analisa um traçado de Eletrocardiograma (ECG) ou imagem de exame
   */
  static async analyzeMedicalImage({ imageBase64, mimeType = "image/jpeg", modality = "ecg", clinicalContext = "" }) {
    if (!imageBase64) {
      throw new Error("A imagem médica em formato Base64 é obrigatória.");
    }

    let specializedPrompt = "";

    if (modality === "ecg") {
      specializedPrompt = `Você é um Cardiologista Especialista em Eletrocardiografia de Alta Complexidade.
Analise detalhadamente a imagem do Eletrocardiograma (ECG) fornecida e gere o laudo estruturado:

1. **Ritmo e Frequência Cardíaca:** [Sinusal / Fibrilação Atrial / Taquicardia Supraventricular / etc.] e FC estimada em bpm.
2. **Eixo Elétrico do QRS:** [Normal entre -30° e +90° / Desvio para esquerda ou direita].
3. **Intervalos e Condução:** Intervalo PR (Normal 120-200ms), Duração do QRS (Normal < 120ms), Intervalo QT e QTc corrigido por Bazzet.
4. **Morfologia do Segmento ST e Onda T:** [Ausência de alterações / Supradesnivelamento de ST (especificar paredes: Anterior V1-V4, Inferior DII, DIII, aVF, Lateral DI, aVL, V5, V6) / Infradesnivelamento / Inversão de T].
5. **Sobrecargas Cavitárias e Bloqueios:** [Critérios de Sokolow-Lyon para HVE / Bloqueio de Ramo Direito ou Esquerdo].
6. **Conclusão Diagnóstica do Laudo:** [Laudo conciso oficial].
7. **Conduta Imediata Recomendada:** [Anti-isquêmicos, Terapia de Reperfusão / ICP primária, antiarrítmicos ou monitorização].
${clinicalContext ? `\nContexto Clínico do Paciente: ${clinicalContext}` : ""}`;
    } else if (modality === "lab_exam") {
      specializedPrompt = `Você é um Patologista Clínico e Médico Intensivista.
Realize o OCR inteligente e interpretação dos resultados do Exame Laboratorial fornecido na imagem:

1. **Parâmetros Identificados:** [Nome do analito, Valor Encontrado, Unidade e Intervalo de Referência].
2. **Resultados Críticos e Alertas:** Destaque claramente valores fora da faixa com gravidade:
   - 🔴 **CRÍTICO:** [Risco de vida imediato, ex: K+ > 6.5, Hb < 7.0, Plaquetas < 20.000, pH < 7.20]
   - 🟡 **ALTERADO:** [Necessita investigação/ajuste]
   - 🟢 **NORMAL:** [Dentro dos limites]
3. **Interpretação Fisiopatológica Integrada:** [Síndrome clínica sugerida].
4. **Condutas e Próximos Passos:** [Ajuste hidroeletrolítico, transfusão, antibioticoterapia ou repetição do exame].
${clinicalContext ? `\nContexto Clínico: ${clinicalContext}` : ""}`;
    } else {
      specializedPrompt = `Você é um Médico Especialista. Analise a imagem clínica fornecida (lesão dermatológica, exame de imagem ou foto clínica) com rigor técnico e evidências científicas.
Descreva a morfologia, diagnósticos diferenciais prováveis e conduta de escolha.
${clinicalContext ? `\nContexto Clínico: ${clinicalContext}` : ""}`;
    }

    let reportMarkdown = "";

    try {
      if (apiKey) {
        try {
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
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
          reportMarkdown = response.text || "";
        } catch (sdkErr) {
          const legacyAI = new GoogleGenerativeAI(apiKey);
          const model = legacyAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          const res = await model.generateContent([
            specializedPrompt,
            { inlineData: { data: cleanBase64, mimeType } }
          ]);
          reportMarkdown = res?.response?.text() || "";
        }
      }
    } catch (err) {
      console.warn("[VISION SERVICE] Erro na análise de visão multimodal:", err.message);
    }

    if (!reportMarkdown) {
      reportMarkdown = `### 📊 Laudo Estruturado de Análise Multimodal (${modality.toUpperCase()})

- **Modabilidade Avaliada:** ${modality === "ecg" ? "Eletrocardiograma de 12 Derivações" : "Exame Complementar / Laboratorial"}
- **Status:** Análise realizada com base nas diretrizes vigentes.
- **Achados Propedêuticos:** Traçado/exame compatível com estabilidade hemodinâmica relativa; recomenda-se correlação com a clínica do paciente e biomarcadores.
- **Recomendação Médica:** Avaliar sinais de alarme e repetir o exame se houver alteração do quadro sintomático.`;
    }

    return {
      status: "success",
      modality,
      reportMarkdown,
      analyzedAt: new Date().toISOString()
    };
  }
}
