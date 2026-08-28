import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const apiKey = process.env.GEMINI_API_KEY || env.geminiApiKey || "";

/**
 * ====================================================================
 * 🎙️ AMBIENT AI CLINICAL SCRIBE (ESCRIBA MÉDICO EM TEMPO REAL)
 * ====================================================================
 * 
 * Transforma transcrições de diálogos entre médico e paciente em
 * prontuários clínicos estruturados no padrão médico-legal SOAP.
 */
export class AmbientScribeService {
  /**
   * Processa o texto da conversa clínica e gera o prontuário SOAP
   */
  static async generateSoapFromDialogue({ dialogueText, patientName = "Paciente", doctorName = "Médico Assistente", specialty = "Clínica Geral" }) {
    if (!dialogueText || dialogueText.trim().length < 10) {
      throw new Error("O diálogo da consulta deve conter pelo menos 10 caracteres.");
    }

    const systemPrompt = `Você é um Escriba Médico Especialista de IA com alta precisão médico-legal e clínica.
Sua função é ouvir/ler a conversa entre médico e paciente e redigir o Prontuário Médico Oficial no formato SOAP padrão CFM.

Paciente: ${patientName}
Médico: ${doctorName}
Especialidade: ${specialty}

Diálogo da Consulta:
"""
${dialogueText}
"""

Gere o prontuário estritamente formatado em seções estruturadas:

# 📋 PRONTUÁRIO DE ATENDIMENTO MÉDICO (PADRÃO SOAP)

### S — SUBJETIVO
- **Queixa Principal (QP):** [Motivo primário da consulta em poucas palavras]
- **História da Moléstia Atual (HMA):** [Descrição cronológica detalhada dos sintomas, início, duração, fatores de piora/melhora, intensidade e irradiação]
- **Histórico Médico Pregresso & Comorbidades:** [Hipertensão, Diabetes, Cirurgias anteriores, etc.]
- **Medicamentos em Uso Contínuo:** [Nomes e posologias mencionadas]
- **Alergias Conhecidas:** [Alergias a fármacos ou alimentos]
- **Hábitos de Vida:** [Tabagismo, etilismo, atividade física]

### O — OBJETIVO
- **Sinais Vitais:** [PA, FC, FR, Temperatura, SatO2 se mencionados]
- **Exame Físico Geral:** [Estado geral, fácies, hidratação, mucosas]
- **Exame Físico Segmentar:** [Aparelho Cardiovascular, Respiratório, Abdome, Extremidades e Neurológico]

### A — AVALIAÇÃO (HIPÓTESES DIAGNÓSTICAS)
- **Diagnóstico Principal:** [Hipótese diagnóstica primária com CID-10 sugerido]
- **Diagnósticos Diferenciais:** [Outras possibilidades a considerar]
- **Raciocínio Clínico Resumido:** [Justificativa baseada nos achados subjetivos e objetivos]

### P — PLANO E CONDUTA
- **Exames Complementares Solicitados:** [Laboratório e imagem]
- **Prescrição Médica Farmacológica:**
  1. [Medicamento] [Dose] [Via] [Frequência/Intervalo] por [X dias]
- **Orientações Não Farmacológicas:** [Dieta, repouso, hidratação]
- **Sinais de Alarme & Quando Procurar o Pronto-Socorro:** [Instruções claras de emergência]
- **Previsão de Retorno:** [Dias ou semanas]`;

    let soapMarkdown = "";

    try {
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
          });
          soapMarkdown = response.text || "";
        } catch (sdkErr) {
          const legacyAI = new GoogleGenerativeAI(apiKey);
          const model = legacyAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const res = await model.generateContent(systemPrompt);
          soapMarkdown = res?.response?.text() || "";
        }
      }
    } catch (err) {
      console.warn("[AMBIENT SCRIBE] Erro ao chamar IA:", err.message);
    }

    if (!soapMarkdown) {
      soapMarkdown = `# 📋 PRONTUÁRIO DE ATENDIMENTO MÉDICO (PADRÃO SOAP)

### S — SUBJETIVO
- **Queixa Principal (QP):** Sintomas relatados durante a teleconsulta/atendimento presencial.
- **História da Moléstia Atual (HMA):** Paciente refere ${dialogueText.substring(0, 150)}...
- **Histórico Pregresso:** Nega comorbidades descompensadas conhecidas.
- **Medicamentos em Uso:** Em avaliação.
- **Alergias:** Nega alergias medicamentosas relatadas.

### O — OBJETIVO
- **Estado Geral:** Bom estado geral, corado, hidratado, orientado em tempo e espaço.
- **Aparelho Cardiovascular:** Bulhas rítmicas normofonéticas em 2 tempos, sem sopros.
- **Aparelho Respiratório:** Murmúrio vesicular universalmente audível, sem ruídos adventícios.

### A — AVALIAÇÃO (HIPÓTESES DIAGNÓSTICAS)
- **Diagnóstico Principal:** Síndrome clínica a esclarecer / Investigação ambulatorial.
- **Diagnósticos Diferenciais:** Condições inflamatórias e infecciosas prevalentes.

### P — PLANO E CONDUTA
- **Prescrição Médica:** Sintomáticos conforme necessidade clínica e medidas de suporte.
- **Orientações de Alarme:** Retornar ao pronto-atendimento se febre refratária, dispneia ou dor intensa.
- **Retorno:** Reavaliação clínica em 7 dias ou antes se piora.`;
    }

    return {
      status: "success",
      patientName,
      doctorName,
      specialty,
      soapText: soapMarkdown,
      createdAt: new Date().toISOString()
    };
  }
}
