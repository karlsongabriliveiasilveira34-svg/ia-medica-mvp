/**
 * Utilitário de Sanitização LGPD e Anonimização Avançada K-Anonymity (Lei 13.709/2018)
 */

/**
 * Converte idade exata em anos para uma faixa etária de 3 em 3 anos
 * Exemplo: 52 anos -> "faixa etária de 51 a 54 anos"
 */
export function anonymizeAgeInYears(ageNumber) {
  const age = parseInt(ageNumber, 10);
  if (isNaN(age) || age < 0) return `${ageNumber} anos`;
  const lower = Math.floor(age / 3) * 3;
  const upper = lower + 3;
  return `faixa etária de ${lower} a ${upper} anos`;
}

/**
 * Converte idade exata em meses para uma faixa etária de 3 em 3 meses
 * Exemplo: 7 meses -> "faixa etária de 6 a 9 meses"
 */
export function anonymizeAgeInMonths(monthNumber) {
  const months = parseInt(monthNumber, 10);
  if (isNaN(months) || months < 0) return `${monthNumber} meses`;
  const lower = Math.floor(months / 3) * 3;
  const upper = lower + 3;
  return `faixa etária de ${lower} a ${upper} meses`;
}

/**
 * Sanitiza dados pessoais identificáveis (PHI) e aplica K-Anonymity em idades e nomes
 */
export function sanitizePHIAndAnonymize(input) {
  if (!input || typeof input !== "string") return "";
  let text = input;

  // 1. Redação de Documentos e Contatos Pessoais
  text = text.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF REDIGIDO LGPD]");
  text = text.replace(/\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]\b/g, "[RG REDIGIDO LGPD]");
  text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL REDIGIDO LGPD]");
  text = text.replace(/\b(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}\b/g, "[TELEFONE REDIGIDO LGPD]");
  text = text.replace(/\b(prontu[áa]rio|registro|carteira|hc)\s*[:#]?\s*\d+\b/gi, "[PRONTUÁRIO REDIGIDO LGPD]");

  // 2. Anonimização de Idades em Meses (Crianças pequenas: 3 em 3 meses)
  // Ex: "7 meses", "7m", "bebê de 7 meses"
  text = text.replace(/\b(\d{1,2})\s*(meses|mês)\b/gi, (match, p1) => {
    return anonymizeAgeInMonths(p1);
  });

  // 3. Anonimização de Idades em Anos (3 em 3 anos)
  // Ex: "52 anos", "52 anos de idade", "paciente de 52 anos"
  text = text.replace(/\b(\d{1,3})\s*(anos|ano)\b/gi, (match, p1) => {
    return anonymizeAgeInYears(p1);
  });

  // 4. Redação de Nomes Próprios de Pessoas (Exige inicial maiúscula para evitar redigir palavras comuns)
  // Ex: "paciente Joaquim Fernando", "Sr. Carlos Alberto", "Dra. Maria Silva"
  text = text.replace(/(?:paciente|pac|sr|sra|dr|dra)\.?\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+)/g, "paciente [PACIENTE]");

  return text.trim();
}
