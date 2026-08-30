/**
 * Utilitário de Sanitização LGPD e Anonimização Avançada K-Anonymity (Lei 13.709/2018)
 * Desidentifica nomes próprios, converte para gênero clínico ("paciente do sexo masculino/feminino")
 * e aplica anonimização de idades em faixas etárias de 3 em 3 anos/meses.
 */

// Conjunto expandido de nomes próprios masculinos comuns no Brasil
const MALE_NAMES = new Set([
  "renato", "carlos", "joao", "joão", "pedro", "paulo", "jose", "josé", "lucas", "matheus",
  "mateus", "gabriel", "felipe", "filipe", "bruno", "rodrigo", "andre", "andré", "marcelo",
  "fernando", "leonardo", "rafael", "gustavo", "marcos", "daniel", "eduardo", "guilherme",
  "thiago", "tiago", "luiz", "luís", "luis", "henrique", "alex", "diego", "vitor", "victor",
  "antonio", "antônio", "francisco", "ricardo", "marcio", "márcio", "fabio", "fábio", "vinicius",
  "vinícius", "caio", "igor", "otavio", "otávio", "samuel", "arthur", "artur", "bernardo",
  "heitor", "davi", "daví", "lorenzo", "theo", "théo", "joaquim", "claudio", "cláudio",
  "rogerio", "rogério", "sergio", "sérgio", "roberto", "mauricio", "maurício", "cesar", "césar",
  "wagner", "valter", "walter", "ronaldo", "romario", "romário", "adriano", "leandro", "julio",
  "júlio", "danilo", "humberto", "gilberto", "alberto", "renan", "alan", "allan", "nelson",
  "wilson", "sebastiao", "sebastião", "geraldo", "raposo", "raimundo", "jorge", "aloisio", "aloísio"
]);

// Conjunto expandido de nomes próprios femininos comuns no Brasil
const FEMALE_NAMES = new Set([
  "maria", "ana", "mariana", "juliana", "patricia", "patrícia", "camila", "fernanda",
  "gabriela", "aline", "leticia", "letícia", "beatriz", "larissa", "amanda", "jessica",
  "jéssica", "bruna", "paula", "rafaela", "renata", "vanessa", "carolina", "caroline",
  "luana", "daniela", "daniele", "priscila", "priscilla", "claudia", "cláudia", "monica",
  "mônica", "simone", "luciana", "andreia", "andréia", "marcia", "márcia", "silvia",
  "sílvia", "cristina", "tatiana", "tatiane", "helena", "alice", "sophia", "sofia", "manuela",
  "manuella", "isabella", "isabela", "laura", "valentina", "giovanna", "giovana", "luiza",
  "luísa", "clarice", "cecilia", "cecília", "teresa", "tereza", "aparecida", "fatima", "fátima",
  "francisca", "elizabeth", "elisabete", "denise", "vera", "sonia", "sônia", "rita", "rosana",
  "rosangela", "rosângela", "sueli", "suely", "eliane", "adriana", "regina", "marta", "elza"
]);

/**
 * Identifica o gênero predominante a partir de um nome ou conjunto de nomes
 */
export function inferGenderFromName(nameString) {
  if (!nameString || typeof nameString !== "string") return null;
  const tokens = nameString.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
  
  for (const token of tokens) {
    if (MALE_NAMES.has(token)) return "masculino";
    if (FEMALE_NAMES.has(token)) return "feminino";
  }

  // Heurística fonética clássica em Português para terminações típicas
  const firstName = tokens[0];
  if (firstName.length > 2) {
    if (firstName.endsWith("o") || firstName.endsWith("os") || firstName.endsWith("or") || firstName.endsWith("on")) {
      return "masculino";
    }
    if (firstName.endsWith("a") || firstName.endsWith("as") || firstName.endsWith("ia") || firstName.endsWith("is")) {
      return "feminino";
    }
  }

  return null;
}

/**
 * Converte idade exata em anos para uma faixa etária de 3 em 3 anos
 * Exemplo: 52 anos -> "faixa etária de 51 a 54 anos"
 */
export function anonymizeAgeInYears(ageNumber) {
  const age = Number.parseInt(ageNumber, 10);
  if (Number.isNaN(age) || age < 0) return `${ageNumber} anos`;
  const lower = Math.floor(age / 3) * 3;
  const upper = lower + 3;
  return `faixa etária de ${lower} a ${upper} anos`;
}

/**
 * Converte idade exata em meses para uma faixa etária de 3 em 3 meses
 * Exemplo: 7 meses -> "faixa etária de 6 a 9 meses"
 */
export function anonymizeAgeInMonths(monthNumber) {
  const months = Number.parseInt(monthNumber, 10);
  if (Number.isNaN(months) || months < 0) return `${monthNumber} meses`;
  const lower = Math.floor(months / 3) * 3;
  const upper = lower + 3;
  return `faixa etária de ${lower} a ${upper} meses`;
}

/**
 * Sanitiza dados pessoais identificáveis (PHI) e aplica K-Anonymity em idades e nomes
 * Converte referências como "Renato, 52 anos" -> "Paciente do sexo masculino, faixa etária de 51 a 54 anos"
 */
export function sanitizePHIAndAnonymize(input) {
  if (!input || typeof input !== "string") return "";
  let text = input;

  // 1. Redação de Documentos e Contatos Pessoais
  text = text.replaceAll(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF REDIGIDO LGPD]");
  text = text.replaceAll(/\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]\b/g, "[RG REDIGIDO LGPD]");
  text = text.replaceAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL REDIGIDO LGPD]");
  text = text.replaceAll(/\b(?:\(?\d{2}\)?\s)?9?\d{4}-?\d{4}\b/g, "[TELEFONE REDIGIDO LGPD]");
  text = text.replaceAll(/\b(?:prontu[áa]rio|registro|carteira|hc)\s*[:#]?\d+/gi, "[PRONTUÁRIO REDIGIDO LGPD]");

  // 2. Anonimização de Idades em Meses (Crianças pequenas: 3 em 3 meses)
  // Ex: "7 meses", "7m", "bebê de 7 meses"
  text = text.replaceAll(/\b(\d{1,2})\s*(meses|mês)\b/gi, (match, p1) => {
    return anonymizeAgeInMonths(p1);
  });

  // 3. Anonimização de Idades em Anos (3 em 3 anos)
  // Ex: "52 anos", "52 anos de idade", "paciente de 52 anos"
  text = text.replaceAll(/\b(\d{1,3})\s*(anos|ano)\b/gi, (match, p1) => {
    return anonymizeAgeInYears(p1);
  });

  // 4. Anonimização e Conversão de Gênero para Nomes com Prefixos Formais
  // Ex: "paciente Renato", "o paciente Carlos Silva", "Dra. Maria", "Seu Joaquim", "Dona Francisca"
  text = text.replaceAll(/(?:(o|a)\s+)?(?:paciente|pac|sr|sra|dr|dra|seu|dona)\.?\s+([A-Za-zÀ-Úà-ú]+(?:\s[A-Za-zÀ-Úà-ú]+){0,5})/gi, (match, article, nameStr) => {
    const gender = inferGenderFromName(nameStr) || (article === 'a' || /sra|dra|dona/i.test(match) ? 'feminino' : 'masculino');
    return gender === 'feminino' ? "paciente do sexo feminino" : "paciente do sexo masculino";
  });

  // 5. Anonimização e Conversão de Nomes Isolados no Início da Frase ou Antes de Idade / Sintoma
  // Ex: "Renato, 52 anos...", "Renato tem dor...", "Maria com febre...", "Carlos de 45 anos..."
  text = text.replaceAll(/^([A-Za-zÀ-Úà-ú]+(?:\s+[A-Za-zÀ-Úà-ú]+)?)(?=,\s*(?:faixa\s+et[áa]ria|\d+|com|apresenta|est[áa]|refere|inicia|queixa)|(?:\s+(?:tem|est[áa]|apresenta|refere|inicia|de\s+\d+|de\s+faixa)))/gi, (match, nameStr) => {
    // Não substituir palavras que já são termos clínicos comuns
    const lower = nameStr.toLowerCase();
    const reservedWords = ["paciente", "caso", "quadro", "crianca", "criança", "idoso", "idosa", "homem", "mulher", "bebe", "bebê", "recem", "recém"];
    if (reservedWords.includes(lower)) return nameStr;

    const gender = inferGenderFromName(nameStr);
    if (gender === 'feminino') {
      return "Paciente do sexo feminino";
    } else if (gender === 'masculino') {
      return "Paciente do sexo masculino";
    }
    return "Paciente";
  });

  return text.trim();
}
