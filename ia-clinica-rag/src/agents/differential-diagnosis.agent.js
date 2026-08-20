import { generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";

export class DifferentialDiagnosisAgent {
  /**
   * Calcula as probabilidades diagnósticas diferenciais estruturadas (soma 100%) para o painel visual
   */
  static async calculateProbabilities({ question, analysis, agentName }) {
    console.log(`\n📊 [LOG DIAGNÓSTICO DIFERENCIAL] Calculando matriz probabilística de diagnósticos diferenciais...`);

    const prompt = `
Você é um especialista em Raciocínio Clínico Bayesiano e Diagnóstico Diferencial em ${agentName || "Medicina Clínica"}.

Dado o caso clínico / dúvida médica:
"${question}"

Calcule de 3 a 5 Hipóteses Diagnósticas Diferenciais relevantes.
ATENÇÃO ESTRITA: A soma de todas as probabilidades DEVE SER EXATAMENTE 100%.

Responda ESTRITAMENTE em formato JSON (sem markdown adicional):
[
  {
    "doenca": "Nome da Doença / Diagnóstico 1",
    "probabilidade": 70, // Número inteiro, ex: 70
    "intervaloProbabilidade": "65% - 75%", // Incerteza Bayesiana
    "urgencia": "Crítico" | "Alto" | "Médio" | "Baixo",
    "justificativaClinica": "Justificativa embasada nos sintomas e exames",
    "achadosChave": ["Achado 1", "Achado 2"],
    "examesRecomendados": ["Exame 1", "Exame 2"]
  },
  {
    "doenca": "Nome da Doença / Diagnóstico 2",
    "probabilidade": 20,
    "intervaloProbabilidade": "15% - 25%",
    "urgencia": "Alto",
    "justificativaClinica": "Justificativa secundária",
    "achadosChave": ["Achado 1"],
    "examesRecomendados": ["Exame 1"]
  },
  {
    "doenca": "Nome da Doença / Diagnóstico 3",
    "probabilidade": 10,
    "intervaloProbabilidade": "5% - 15%",
    "urgencia": "Médio",
    "justificativaClinica": "Hipótese de menor probabilidade",
    "achadosChave": ["Achado 1"],
    "examesRecomendados": ["Exame 1"]
  }
]
`;

    try {
      const response = await generateWithRetry({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ [LOG DIAGNÓSTICO DIFERENCIAL] Matriz Calculada: ${parsed.length} hipóteses (${parsed.map(d => `${d.doenca}: ${d.probabilidade}%`).join(", ")})`);
        return parsed;
      }
    } catch (err) {
      console.warn("⚠️ [LOG DIAGNÓSTICO DIFERENCIAL AVISO] Falha ao calcular probabilidades via LLM:", err.message);
    }

    return [];
  }
}
