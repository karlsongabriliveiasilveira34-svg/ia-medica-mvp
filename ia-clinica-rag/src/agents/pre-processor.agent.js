import { generateWithRetry } from "../services/gemini.service.js";
import { env } from "../config/env.js";

export class PreProcessorAgent {
  /**
   * Remove Dados Pessoais Identificáveis (PHI/LGPD) via Regex + Prompt leve
   */
  static sanitizePHI(input) {
    let text = input;
    text = text.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF REMOVIDO]");
    text = text.replace(/\b(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}\b/g, "[TELEFONE REMOVIDO]");
    text = text.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, "[DATA REMOVIDA]");
    return text.trim();
  }

  /**
   * Expande a consulta com nomenclaturas médicas padronizadas (MeSH / DeCS / CID-11) com LOG TOTAL
   */
  static async expandMedicalQuery(query) {
    const sanitized = this.sanitizePHI(query);
    console.log(`\n🧹 [LOG PRE-PROCESSOR] Sanitização de PHI / LGPD concluída: "${sanitized}"`);

    try {
      const prompt = `
Você é um especialista em terminologia médica clínica.
Receba a pergunta do usuário e retorne uma versão expandida com termos técnicos médicos padronizados (MeSH, DeCS, CID-11) e sinônimos clínicos relevantes em português.

Pergunta do usuário: "${sanitized}"

Responda EXATAMENTE no seguinte formato JSON (sem markdown adicional):
{
  "original": "${sanitized}",
  "sanitizedQuery": "${sanitized}",
  "expandedQuery": "pergunta expandida com termos técnicos e sinônimos",
  "keywords": ["termo1", "termo2", "termo3"],
  "medicalTerms": ["CID-11", "MeSH"]
}
`;

      const response = await generateWithRetry({
        model: env.geminiModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text.trim());
      console.log(`✅ [LOG PRE-PROCESSOR] Pergunta Expandida com Sucesso: "${parsed.expandedQuery}"`);

      return {
        sanitizedQuery: sanitized,
        expandedQuery: parsed.expandedQuery || sanitized,
        keywords: parsed.keywords || [sanitized],
        medicalTerms: parsed.medicalTerms || []
      };
    } catch (error) {
      console.warn("⚠️ [LOG PRE-PROCESSOR AVISO] Falha na expansão de termos médicos pelo PreProcessorAgent, usando consulta sanitizada:", error.message);
      return {
        sanitizedQuery: sanitized,
        expandedQuery: sanitized,
        keywords: sanitized.split(" ").filter(w => w.length > 3),
        medicalTerms: []
      };
    }
  }
}
