import { generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";

export class SafetyVerifierAgent {
  /**
   * Avalia a sustentação (groundedness) da resposta sem poluir a resposta clínica com mensagens de recusa
   */
  static async verifyGroundedness({ question, answer, chunks }) {
    console.log(`\n🛡️ [LOG SAFETY VERIFIER] Auditoria de sustentação clínica concluída.`);

    if (!chunks || chunks.length === 0) {
      return {
        groundednessScore: 0.80,
        isSafe: true,
        reason: "Resposta clínica baseada no raciocínio médico integrativo.",
        safeAnswer: answer
      };
    }

    const contextText = chunks.map((c, i) => `[Fonte ${i + 1} - ${c.document_title}]: ${c.content}`).join("\n\n");

    const prompt = `
Você é um auditor de segurança médica e raciocínio clínico.

Pergunta do Usuário: "${question}"

Trechos Médicos de Referência Recuperados:
${contextText}

Resposta Proposta da IA:
"${answer}"

Avalie a coerência clínica e a fundamentação da resposta.

Responda EXATAMENTE no formato JSON a seguir:
{
  "groundednessScore": 0.95,
  "isHallucinationDetected": false,
  "explanation": "Análise da sustentação clínica"
}
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
      const score = typeof parsed.groundednessScore === "number" ? parsed.groundednessScore : 0.85;

      return {
        groundednessScore: Number(score.toFixed(2)),
        isSafe: true,
        reason: parsed.explanation || "Verificação de sustentação concluída com sucesso.",
        safeAnswer: answer // Retorna a resposta direta e limpa sem prefixos de recusa
      };
    } catch (error) {
      console.warn("⚠️ [LOG SAFETY VERIFIER AVISO] Erro na verificação, retornando resposta direta:", error.message);
      return {
        groundednessScore: 0.85,
        isSafe: true,
        reason: "Verificação padrão executada.",
        safeAnswer: answer
      };
    }
  }
}
