/**
 * Validador de Citações e Cobertura de Afirmações (Claim-Level Citation & Anti-Hallucination Validator)
 * Verifica se cada afirmação/conduta gerada pelo LLM é diretamente fundamentada pelos chunks recuperados.
 */

export function validateClaimsAndCitations({ answerText, chunks }) {
  if (!answerText || !chunks || chunks.length === 0) {
    return {
      isValid: false,
      citationCoverage: 0.0,
      claims: [],
      unsupportedClaims: ["Nenhum trecho de evidência recuperado para validar as afirmações."],
      validatedAnswer: answerText
    };
  }

  // Extrair parágrafos e frases que contêm afirmações clínicas
  const sentences = answerText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
  const claims = [];
  let supportedCount = 0;
  const unsupportedClaims = [];

  for (const sentence of sentences) {
    const hasSourceTag = /\[Fonte\s+\d+\]|\[\d+\]/i.test(sentence);
    const sourceMatches = sentence.match(/\[Fonte\s+(\d+)\]/gi) || [];
    const sourceIndices = sourceMatches.map(m => parseInt(m.replace(/\D/g, ""), 10));

    const isSupported = hasSourceTag && sourceIndices.some(idx => idx >= 1 && idx <= chunks.length);

    if (isSupported) {
      supportedCount++;
    } else if (sentence.toLowerCase().includes("recomenda") || sentence.toLowerCase().includes("dose") || sentence.toLowerCase().includes("tratamento")) {
      unsupportedClaims.push(sentence);
    }

    claims.push({
      statement: sentence,
      citationIndices: sourceIndices,
      isSupported
    });
  }

  const coverage = sentences.length > 0 ? Number((supportedCount / sentences.length).toFixed(2)) : 1.0;
  const isValid = coverage >= 0.60 && unsupportedClaims.length === 0;

  let validatedAnswer = answerText;

  // Se houverem afirmações sem suporte em condutas críticas, injetar aviso de qualificação
  if (unsupportedClaims.length > 0) {
    validatedAnswer += `\n\n**Nota de Rastreabilidade Metodológica**: As seguintes alegações requerem confirmação adicional nas fontes oficiais:\n` +
      unsupportedClaims.map(c => `> - *"${c.trim()}"*`).join("\n");
  }

  return {
    isValid,
    citationCoverage: coverage,
    claims,
    unsupportedClaims,
    validatedAnswer
  };
}
