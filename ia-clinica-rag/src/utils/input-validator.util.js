/**
 * Utilitário de Validação de Sanidade da Entrada do Usuário (Prevenção contra Gibberish / Lixo)
 */

/**
 * Verifica se a entrada do usuário possui conteúdo interpretável ou se é entrada inválida (gibberish/lixo)
 */
export function validateInputSanity(input) {
  if (!input || typeof input !== "string") {
    return { isValid: false, reason: "EMPTY_INPUT" };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { isValid: false, reason: "EMPTY_INPUT" };
  }

  // Permitir saudações curtas legítimas (ex.: "oi", "olá", "hi")
  const validShortGreetings = /^(oi+|ol[áa]|hi|hey|bom\s+dia|boa\s+tarde|boa\s+noite)[!?.\s]*$/i;
  if (validShortGreetings.test(trimmed)) {
    return { isValid: true, reason: "GREETING" };
  }

  // 1. Verificar se contém apenas pontuações ou símbolos (ex: "...", "!!!", "???", "---")
  const symbolsOnlyRegex = /^[\s\p{P}\p{S}\d]+$/u;
  if (symbolsOnlyRegex.test(trimmed) && !/\w{2,}/.test(trimmed)) {
    return { isValid: false, reason: "SYMBOLS_ONLY" };
  }

  // 2. Verificar repetições curtas de risadas ou caracteres sem sentido (ex: "kkkkkk", "asdfgh", "qwerty", "123456", "abc")
  const gibberishPatterns = [
    /^[kK]{3,}$/,                             // kkkkkk
    /^[aA][sS][dD][fF][gG]?[hH]?$/i,          // asdfgh
    /^[qQ][wW][eE][rR][tT]?[yY]?$/i,          // qwerty
    /^[zZ][xX][cC][vV][bB]?[nN]?$/i,          // zxcvb
    /^\d{1,6}$/,                              // 123456 (apenas números isolados sem contexto)
    /^[a-zA-Z]{1,2}$/                         // a, ab, abc (palavras de 1-2 letras soltas sem significado)
  ];

  for (const pattern of gibberishPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, reason: "GIBBERISH_OR_SHORT" };
    }
  }

  // 3. Verificar ausência de vogais em palavras longas sem sentido (ex: "thgrjfk")
  const lettersOnly = trimmed.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length > 5 && !/[aeiouAEIOU]/.test(lettersOnly)) {
    return { isValid: false, reason: "NO_VOWELS_GIBBERISH" };
  }

  return { isValid: true, reason: "VALID" };
}

/**
 * Mensagens padrão configuráveis para entradas inválidas ou fora de escopo
 */
export const SYSTEM_FALLBACK_MESSAGES = {
  INVALID_INPUT: "Não foi possível interpretar sua solicitação. Por favor, envie uma pergunta, dúvida ou caso clínico válido relacionado à área da saúde.",
  OUT_OF_SCOPE: "Esta pergunta está fora do objetivo da plataforma MedIa. Posso ajudar com conteúdos relacionados à medicina, saúde, prática clínica e estudos médicos.",
  INCOMPLETE_CLINICAL_CASE: "Para analisar este caso clínico com precisão, preciso de mais informações sobre o paciente (como queixa principal, tempo de evolução, histórico de comorbidades ou sinais vitais disponíveis)."
};
