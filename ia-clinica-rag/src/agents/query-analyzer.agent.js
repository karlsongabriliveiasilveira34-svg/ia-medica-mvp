import { gemini } from "../services/gemini.service.js";
import { env } from "../config/env.js";

export class QueryAnalyzerAgent {
  /**
   * Analisa a pergunta do usuário e extrai a intenção clínica, entidades e lacunas de informação com LOGS DETALHADOS
   */
  static async analyzeQuery(queryText, historyText = "") {
    console.log(`\n🔍 [LOG QUERY ANALYZER] Analisando intenção clínica para: "${queryText}"...`);

    const historySection = historyText ? `HISTÓRICO ACUMULADO DA SESSÃO:\n${historyText}\n\n` : "";

    const prompt = `
Você é um especialista em Análise de Intenção e Entidades Clínicas (Clinical Query Analyzer).
${historySection}Pergunta / Mensagem Atual: "${queryText}"

Analise a dúvida médica ou mensagem acima, considerando o histórico se presente.

Extraia as seguintes informações e retorne ESTRITAMENTE em formato JSON:
{
  "intent": "diagnosis_differential" | "conduct" | "treatment" | "exam" | "exam_interpretation" | "dose" | "drug_interaction" | "emergency" | "protocol" | "general",
  "suggestedSpecialty": "cardiology" | "neurology" | "pediatrics" | "emergency_medicine" | "infectious_diseases" | "gynecology_obstetrics" | "neurosurgery" | "general_medicine",
  "confidenceScore": 0.95,
  "patientContext": {
    "age": number | null,
    "sex": "M" | "F" | null,
    "symptoms": ["dor torácica", "sudorese"],
    "duration": "2 horas",
    "severity": "alta",
    "comorbidities": [],
    "medications": []
  },
  "clinicalEntities": ["Troponina I", "ECG", "Supradesnivelamento ST"],
  "missingCriticalInformation": ["Histórico de alergias", "Função renal"]
}
`;

    try {
      const response = await gemini.models.generateContent({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      console.log(`✅ [LOG QUERY ANALYZER] Análise Concluída:`, {
        intent: parsed.intent,
        specialty: parsed.suggestedSpecialty,
        confidence: parsed.confidenceScore
      });

      return {
        intent: parsed.intent || "general",
        suggestedSpecialty: parsed.suggestedSpecialty || "general_medicine",
        confidenceScore: parsed.confidenceScore || 0.8,
        patientContext: parsed.patientContext || {},
        clinicalEntities: parsed.clinicalEntities || [],
        missingCriticalInformation: parsed.missingCriticalInformation || []
      };
    } catch (err) {
      console.error("❌ [LOG QUERY ANALYZER ERRO] Falha na análise de intenção clínica:", err.message);
      return {
        intent: "general",
        suggestedSpecialty: "general_medicine",
        confidenceScore: 0.5,
        patientContext: {},
        clinicalEntities: [],
        missingCriticalInformation: []
      };
    }
  }
}
