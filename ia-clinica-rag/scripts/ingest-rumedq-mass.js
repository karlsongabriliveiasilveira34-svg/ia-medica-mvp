import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { normalizeFlashcard } from "../src/adapters/question-flashcard.adapter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_URL = "https://raw.githubusercontent.com/sberbank-ai-lab/RuMedQ/master/russian_medical_questions_dataset.csv";
const OUTPUT_JSON_PATH = path.resolve(__dirname, "../src/database/rumedq-dataset.json");

// Dicionário de termos anatômicos russos -> português
const ANATOMY_DICTIONARY = {
  "глазах": "nos Olhos / Ocular",
  "глаза": "nos Olhos",
  "веках": "nas Pálpebras",
  "ушах": "nos Ouvidos / Otalgia",
  "ухе": "no Ouvido",
  "горле": "na Garganta / Odinofagia",
  "груди": "no Tórax / Precordialgia",
  "грудине": "no Esterno / Retrosternal",
  "животе": "no Abdome / Dor Abdominal",
  "спине": "no Dorso / Dorsalgia",
  "верхней части спины": "na Região Torácica Posterior / Escápulas",
  "пояснице": "na Região Lombar / Lombalgia",
  "шее": "no Pescoço / Cervicalgia",
  "боку": "no Flanco / Hipocôndrio",
  "левом подреберье": "no Hipocôndrio Esquerdo (Baço/Estômago)",
  "правом подреберье": "no Hipocôndrio Direito (Fígado/Vesícula)",
  "бедре": "no Quadril / Coxa",
  "голени": "na Panturrilha / Perna",
  "голеностопных суставах": "nos Tornozelos",
  "коленных суставах": "nos Joelhos (Gonalgia)",
  "кистях": "nas Mãos",
  "запястьях": "nos Punhos",
  "пальцах": "nos Dedos",
  "конечностях": "nos Membros Superiores/Inferiores",
  "суставах": "nas Articulações (Artralgia)",
  "мышцах": "na Musculatura (Mialgia)",
  "костях": "nos Ossos",
  "стопах": "nos Pés (Podalgia)",
  "пятках": "no Calcanhar",
  "плече": "no Ombro",
  "локте": "no Cotovelo",
  "затылке": "na Nuca / Região Occipital",
  "висках": "nas Têmporas",
  "лбу": "na Região Frontal",
  "лице": "na Face (Trigêmeo / Paralisia Facial)",
  "носу": "no Nariz / Rinofaringe",
  "зубах": "nos Dentes / Odontalgia",
  "деснах": "nas Gengivas / Periodonto",
  "языке": "na Língua (Glossite)",
  "прямой кишке": "no Reto / Proctalgia",
  "заднем проходе": "no Ânus / Prurido Anal",
  "мочевом пузыре": "na Bexiga / Hipogástrio",
  "почках": "nos Rins / Cólica Nefrética"
};

// Dicionário de termos semiológicos clínicos diretos
const CLINICAL_TERMS_MAP = {
  "аритмия": { pt: "Arritmia Cardíaca / Descompasso", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia" },
  "тахикардия": { pt: "Taquicardia / Palpitações Rápidas", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia" },
  "брадикардия": { pt: "Bradicardia / FC Baixa", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia" },
  "одышка": { pt: "Dispneia / Falta de Ar", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia & Pneumologia" },
  "одышка при нагрузке": { pt: "Dispneia aos Esforços", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia" },
  "одышка в покое": { pt: "Dispneia em Repouso / Ortopneia", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia" },
  "кашель": { pt: "Tosse / Secreção Respiratória", deck: "infecto", area: "Clínica Médica", topic: "Infectologia & Pneumologia" },
  "кашель с мокротой": { pt: "Tosse Produtiva / Catarro", deck: "infecto", area: "Clínica Médica", topic: "Infectologia" },
  "сухой кашель": { pt: "Tosse Seca / Irritativa", deck: "infecto", area: "Clínica Médica", topic: "Pneumologia" },
  "лихорадка": { pt: "Febre / Síndrome Febril Aguda", deck: "infecto", area: "Clínica Médica", topic: "Infectologia" },
  "повышение температуры": { pt: "Pirexia / Hipertermia", deck: "infecto", area: "Clínica Médica", topic: "Infectologia" },
  "сыпь": { pt: "Exantema / Lesão Cutânea", deck: "infecto", area: "Clínica Médica", topic: "Dermatologia & Infectologia" },
  "сыпь на коже": { pt: "Erupção Cutânea Maculopapular", deck: "infecto", area: "Clínica Médica", topic: "Dermatologia" },
  "зуд": { pt: "Prurido / Coceira Cutânea", deck: "infecto", area: "Clínica Médica", topic: "Dermatologia" },
  "зуд кожи": { pt: "Prurido Cutâneo Generalizado", deck: "infecto", area: "Clínica Médica", topic: "Dermatologia & Alergia" },
  "отеки": { pt: "Edema / Retenção Hídrica", deck: "nefro", area: "Clínica Médica", topic: "Nefrologia & Cardiologia" },
  "отеки ног": { pt: "Edema de Membros Inferiores", deck: "nefro", area: "Clínica Médica", topic: "Nefrologia & Cardiologia" },
  "тошнота": { pt: "Náuseas e Mal-estar Gástrico", deck: "clinica", area: "Clínica Médica", topic: "Gastroenterologia" },
  "рвота": { pt: "Vômitos e Êmese Recorrente", deck: "pediatria", area: "Pediatria & Puericultura", topic: "Gastroenterologia Pediátrica" },
  "тошнота и рвота": { pt: "Náuseas e Vômitos", deck: "pediatria", area: "Pediatria & Puericultura", topic: "Pediatria" },
  "диарея": { pt: "Diarreia Aguda / Fezes Líquidas", deck: "pediatria", area: "Pediatria & Puericultura", topic: "Infectologia Pediátrica" },
  "запор": { pt: "Constipação Intestinal / Obstipação", deck: "clinica", area: "Clínica Médica", topic: "Gastroenterologia" },
  "головокружение": { pt: "Tontura e Vertigem", deck: "clinica", area: "Clínica Médica", topic: "Neurologia & Labirinto" },
  "головная боль": { pt: "Cefaleia / Dor de Cabeça", deck: "clinica", area: "Clínica Médica", topic: "Neurologia" },
  "судороги": { pt: "Crises Convulsivas", deck: "clinica", area: "Clínica Médica", topic: "Neurologia de Emergência" },
  "слабость": { pt: "Astenia / Fraqueza Muscular", deck: "clinica", area: "Clínica Médica", topic: "Clínica Geral" },
  "апатия": { pt: "Apatia / Desânimo Profundo", deck: "clinica", area: "Clínica Médica", topic: "Psiquiatria & Saúde Mental" },
  "сниженное настроение": { pt: "Humor Depressivo / Anedonia", deck: "clinica", area: "Clínica Médica", topic: "Psiquiatria" },
  "бессонница": { pt: "Insônia / Distúrbio do Sono", deck: "clinica", area: "Clínica Médica", topic: "Medicina do Sono" },
  "беспокойный сон": { pt: "Sono Agitado / Pesadelos", deck: "clinica", area: "Clínica Médica", topic: "Medicina do Sono" },
  "сонливость": { pt: "Sonolência Diurna Excessiva", deck: "clinica", area: "Clínica Médica", topic: "Neurologia & Sono" },
  "агрессивность": { pt: "Agitação Psicomotora / Irritabilidade", deck: "clinica", area: "Clínica Médica", topic: "Psiquiatria" },
  "агрессивные мысли": { pt: "Ideação Agressiva / Impulsividade", deck: "clinica", area: "Clínica Médica", topic: "Psiquiatria" },
  "аллергия": { pt: "Reação Alérgica / Hipersensibilidade", deck: "infecto", area: "Clínica Médica", topic: "Alergologia & Imunologia" },
  "аллергические отеки": { pt: "Angioedema / Edema Alérgico", deck: "infecto", area: "Clínica Médica", topic: "Imunologia & Emergência" },
  "ассиметрия лица": { pt: "Assimetria Facial / Paralisia de Bell ou AVC", deck: "clinica", area: "Clínica Médica", topic: "Neurologia de Urgência" },
  "бледность": { pt: "Palidez Cutâneo-Mucosa / Suspeita de Anemia", deck: "clinica", area: "Clínica Médica", topic: "Hematologia" },
  "бледность кожи": { pt: "Palidez Cutânea Generalizada", deck: "clinica", area: "Clínica Médica", topic: "Hematologia" },
  "бледность лица": { pt: "Palidez Facial", deck: "clinica", area: "Clínica Médica", topic: "Hematologia" },
  "бледность губ": { pt: "Palidez Labial e de Mucosas", deck: "clinica", area: "Clínica Médica", topic: "Hematologia" },
  "болезненная дефекация": { pt: "Proctalgia / Evacuação Dolorosa", deck: "cirurgia", area: "Cirurgia Geral & Trauma", topic: "Coloproctologia" },
  "болезненный оргазм": { pt: "Dispareunia / Dor Pélvica", deck: "go", area: "Ginecologia & Obstetrícia", topic: "Ginecologia Geral" },
  "кровотечение": { pt: "Hemorragia / Sangramento Ativo", deck: "go", area: "Ginecologia & Obstetrícia", topic: "Obstetrícia & Emergências" },
  "кровь в моче": { pt: "Hematúria / Sangue na Urina", deck: "nefro", area: "Clínica Médica", topic: "Nefrologia & Urologia" },
  "кровь в стуле": { pt: "Enterorragia / Sangue nas Fezes", deck: "cirurgia", area: "Cirurgia Geral & Trauma", topic: "Gastroenterologia Cirúrgica" },
  "жжение при мочеиспускании": { pt: "Disúria / Ardor Miccional", deck: "nefro", area: "Clínica Médica", topic: "Urologia & Nefrologia" },
  "частое мочеиспускание": { pt: "Polaquiúria / Micção Frequente", deck: "nefro", area: "Clínica Médica", topic: "Urologia & Endocrinologia" },
  "потеря веса": { pt: "Perda Ponderal Involuntária", deck: "clinica", area: "Clínica Médica", topic: "Oncologia & Endocrinologia" },
  "жажда": { pt: "Polidipsia / Sede Excessiva", deck: "clinica", area: "Clínica Médica", topic: "Endocrinologia (Diabetes)" },
  "сухость во рту": { pt: "Xerostomia / Boca Seca", deck: "clinica", area: "Clínica Médica", topic: "Reumatologia & Endocrinologia" },
  "потливость": { pt: "Sudorese Noturna / Diaforese", deck: "infecto", area: "Clínica Médica", topic: "Infectologia (TB / Linfoma)" },
  "тремор": { pt: "Tremor de Extremidades / Parkinsonismo", deck: "clinica", area: "Clínica Médica", topic: "Neurologia" },
  "онемение": { pt: "Parestesia / Dormência", deck: "clinica", area: "Clínica Médica", topic: "Neurologia & Neuropatia" },
  "потеря аппетита": { pt: "Hiporexia / Anorexia", deck: "clinica", area: "Clínica Médica", topic: "Clínica Geral" },
  "изжога": { pt: "Pirose / Queimação Retrosternal (DRGE)", deck: "clinica", area: "Clínica Médica", topic: "Gastroenterologia" },
  "отрыжка": { pt: "Eructação / Dispepsia", deck: "clinica", area: "Clínica Médica", topic: "Gastroenterologia" },
  "вздутие живота": { pt: "Meteorismo / Distensão Abdominal", deck: "cirurgia", area: "Cirurgia Geral & Trauma", topic: "Gastroenterologia" },
  "обморок": { pt: "Síncope / Perda Súbita de Consciência", deck: "cardio", area: "Clínica Médica", topic: "Cardiologia & Neurologia" },
  "шум в ушах": { pt: "Tinnitus / Zumbido no Ouvido", deck: "clinica", area: "Clínica Médica", topic: "Otorrinolaringologia" },
  "снижение слуха": { pt: "Hipoacusia / Perda Auditiva", deck: "clinica", area: "Clínica Médica", topic: "Otorrinolaringologia" },
  "слезотечение": { pt: "Epífora / Lacrimejamento Ocular", deck: "infecto", area: "Clínica Médica", topic: "Oftalmologia" },
  "сухость глаз": { pt: "Xeroftalmia / Olhos Secos", deck: "clinica", area: "Clínica Médica", topic: "Reumatologia (Sjögren)" }
};

function parseSymptomDetails(ruSymptom) {
  const clean = ruSymptom.toLowerCase().trim();

  // Match exato
  if (CLINICAL_TERMS_MAP[clean]) {
    return CLINICAL_TERMS_MAP[clean];
  }

  // Sintomas de dor em partes do corpo
  if (clean.startsWith("боль в ") || clean.startsWith("боли в ") || clean.startsWith("боль ") || clean.startsWith("боли ")) {
    const part = clean.replace(/^бол[ьи]\s*(?:в\s*)?/i, "").trim();
    const ptPart = ANATOMY_DICTIONARY[part] || `na região de ${part}`;

    let deck = "clinica";
    let topic = "Semiologia da Dor";
    let area = "Clínica Médica";

    if (part.includes("живот") || part.includes("подреберь") || part.includes("кишк") || part.includes("бок")) {
      deck = "cirurgia";
      topic = "Dor Abdominal & Cirurgia";
      area = "Cirurgia Geral & Trauma";
    } else if (part.includes("груд") || part.includes("сердц")) {
      deck = "cardio";
      topic = "Cardiologia & Dor Torácica";
    } else if (part.includes("сустав") || part.includes("колен") || part.includes("кост") || part.includes("плеч") || part.includes("локт")) {
      deck = "clinica";
      topic = "Reumatologia & Ortopedia";
    } else if (part.includes("горл") || part.includes("ух")) {
      deck = "infecto";
      topic = "Infectologia & Otorrino";
    } else if (part.includes("поясниц") || part.includes("почк")) {
      deck = "nefro";
      topic = "Nefrologia & Lombalgia";
    } else if (part.includes("орг") || part.includes("матк") || part.includes("яичн")) {
      deck = "go";
      topic = "Ginecologia & Obstetrícia";
      area = "Ginecologia & Obstetrícia";
    }

    return {
      pt: `Dor ${ptPart}`,
      deck,
      area,
      topic
    };
  }

  // Sintomas de inchaço/edema
  if (clean.startsWith("отек") || clean.startsWith("отеки")) {
    const part = clean.replace(/^отек[и]?\s*(?:в\s*)?/i, "").trim();
    const ptPart = ANATOMY_DICTIONARY[part] || part;
    return {
      pt: `Edema (${ptPart || "Membros Inferiores"})`,
      deck: "nefro",
      area: "Clínica Médica",
      topic: "Nefrologia & Cardiologia"
    };
  }

  // Sintomas de palidez
  if (clean.startsWith("бледность")) {
    const part = clean.replace(/^бледность\s*/i, "").trim();
    const ptPart = ANATOMY_DICTIONARY[part] || part;
    return {
      pt: `Palidez (${ptPart || "Cutâneo-Mucosa"})`,
      deck: "clinica",
      area: "Clínica Médica",
      topic: "Hematologia & Anemia"
    };
  }

  // Sintomas de coceira/prurido
  if (clean.startsWith("зуд")) {
    const part = clean.replace(/^зуд\s*(?:в\s*)?/i, "").trim();
    const ptPart = ANATOMY_DICTIONARY[part] || part;
    return {
      pt: `Prurido / Coceira (${ptPart || "Cutâneo"})`,
      deck: "infecto",
      area: "Clínica Médica",
      topic: "Dermatologia & Alergia"
    };
  }

  // Fallback limpo com capitalização
  const capitalized = ruSymptom.charAt(0).toUpperCase() + ruSymptom.slice(1);
  return {
    pt: capitalized,
    deck: "clinica",
    area: "Clínica Médica",
    topic: "Semiologia Propedêutica"
  };
}

function stripQuotes(str) {
  let s = String(str || "").trim();
  while (s.startsWith('"') || s.startsWith("'")) {
    s = s.slice(1);
  }
  while (s.endsWith('"') || s.endsWith("'")) {
    s = s.slice(0, -1);
  }
  return s.trim();
}

// Construtor semiológico rico para cada pergunta investigativa única
function buildClinicalInvestigationCard(rawQuestion, symptomPt, index) {
  const cleanQ = stripQuotes(rawQuestion);

  // Categorização da pergunta para gerar verso clinicamente aprofundado
  let investigationType = "Caracterização Geral do Sintoma";
  let ptQuestion = "";
  let rationale = "";

  const qLower = cleanQ.toLowerCase();

  if (qLower.includes("часто ли") || qLower.includes("часто")) {
    investigationType = "Frequência e Periodicidade";
    ptQuestion = `Com que frequência você apresenta episódios de ${symptomPt.toLowerCase()} durante a semana?`;
    rationale = "Avaliar a frequência permite graduar o impacto funcional e distinguir quadros agudos paroxísticos de doenças crônicas descompensadas.";
  } else if (qLower.includes("как давно") || qLower.includes("сколько времени")) {
    investigationType = "Cronologia e Tempo de Evolução";
    ptQuestion = `Há quanto tempo exatamente você notou o início deste quadro de ${symptomPt.toLowerCase()}?`;
    rationale = "A determinação do tempo de evolução (agudo < 2 semanas, subagudo, crônico > 4 semanas) é a base do raciocínio diferencial na propedêutica médica.";
  } else if (qLower.includes("усиливается") || qLower.includes("сильнее") || qLower.includes("при нагрузке")) {
    investigationType = "Fatores Agravantes e Gatilhos";
    ptQuestion = `O que faz o sintoma de ${symptomPt.toLowerCase()} piorar (esforço físico, tosse, respiração profunda, palpação ou postura)?`;
    rationale = "Fatores de piora orientam diretamente a etiologia (ex: dor pior ao esforço = isquemia coronariana; dor pior à tosse = pleurítica/pericárdica).";
  } else if (qLower.includes("иррадиирует") || qLower.includes("отдает")) {
    investigationType = "Irradiação e Território de Dor";
    ptQuestion = `A sensação de ${symptomPt.toLowerCase()} se espalha para dorso, mandíbula, braço esquerdo ou abdome?`;
    rationale = "A irradiação segue dermátomos e trajetos nervosos viscerais fundamentais para diagnóstico sindrômico.";
  } else if (qLower.includes("сопровождается") || qLower.includes("есть ли при этом")) {
    investigationType = "Sintomas Acompanhantes e Sinais Autonômicos";
    ptQuestion = `O quadro de ${symptomPt.toLowerCase()} vem acompanhado de febre, sudorese fria, náuseas, vômitos ou perda de peso?`;
    rationale = "Sintomas associados alertam para infecções sistêmicas, neoplasias ou instabilidade hemodinâmica iminente.";
  } else if (qLower.includes("принимали ли") || qLower.includes("лекарств") || qLower.includes("препарат")) {
    investigationType = "Histórico Farmacológico e Iatrogenia";
    ptQuestion = `O sintoma (${symptomPt.toLowerCase()}) teve início após o uso ou suspensão de algum medicamento?`;
    rationale = "Reações adversas medicamentosas e interações são causas frequentes de queixas que mimetizam doenças orgânicas primárias.";
  } else if (qLower.includes("кошмар") || qLower.includes("страх") || qLower.includes("тревог")) {
    investigationType = "Aspectos Psicoemocionais e Sono";
    ptQuestion = `Apresenta pesadelos, despertar noturno com sobressalto ou sensação de angústia associada?`;
    rationale = "Distúrbios autonômicos do sono e transtornos de ansiedade impactam diretamente sintomas somáticos.";
  } else {
    investigationType = "Investigação Semiológica Específica";
    ptQuestion = `Qual a intensidade, características e impacto de ${symptomPt.toLowerCase()} no seu estado geral?`;
    rationale = "A caracterização completa do sintoma inclui intensidade (escala 0-10), padrão temporal e resposta a analgésicos prévios.";
  }

  return {
    investigationType,
    ptQuestion,
    rationale,
    originalQuery: cleanQ
  };
}

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchCSV(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Erro no download: ${res.statusCode}`));
      }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function runMassIngestion() {
  console.log("=".repeat(80));
  console.log("🚀 EXTRAÇÃO MASSIVA COMPLETA: 4.700+ FLASHCARDS RuMedQ (Sberbank AI Lab)");
  console.log("=".repeat(80));

  const csvContent = await fetchCSV(CSV_URL);
  const lines = csvContent.split(/\r?\n/);
  console.log(`Total de linhas brutas baixadas: ${lines.length}`);

  const processedFlashcards = [];
  const seenHashes = new Set();
  let validCount = 0;
  let skippedInvalid = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    let symptom = "";
    let question = "";
    let isCorrectQ = "0";

    if (parts.length >= 4) {
      symptom = parts[1].replace(/^"|"$/g, "").trim();
      question = parts.slice(2, -1).join(",").replace(/^"|"$/g, "").trim();
      isCorrectQ = parts[parts.length - 1].replace(/^"|"$/g, "").trim();
    } else if (parts.length === 3) {
      symptom = parts[0].replace(/^"|"$/g, "").trim();
      question = parts[1].replace(/^"|"$/g, "").trim();
      isCorrectQ = parts[2].replace(/^"|"$/g, "").trim();
    }

    if (isCorrectQ !== "1" || !symptom || !question) {
      skippedInvalid++;
      continue;
    }

    const mapping = parseSymptomDetails(symptom);
    const details = buildClinicalInvestigationCard(question, mapping.pt, validCount);

    const rawCard = {
      id: `rumedq_${validCount + 1}`,
      front: `🩺 Anamnese Propedêutica: ${mapping.pt}\n\n🎯 Foco da Investigação: ${details.investigationType}`,
      back: `💬 Pergunta clínica recomendada: "${details.ptQuestion}"\n\n📌 Racional Semiológico: ${details.rationale}\n\n📚 Especialidade: ${mapping.area} (${mapping.topic})\n🏷️ Consulta Original: "${details.originalQuery}"`,
      deckId: mapping.deck,
      subject: mapping.area,
      topic: mapping.topic,
      difficulty: "media",
      source: "RuMedQ Dataset (Sber AI Lab / RuMedBench)",
      sourceUrl: "https://github.com/sberbank-ai-lab/RuMedQ"
    };

    const normalized = normalizeFlashcard(rawCard, validCount + 1);
    if (normalized && !seenHashes.has(normalized.hash)) {
      seenHashes.add(normalized.hash);
      processedFlashcards.push(normalized);
      validCount++;
    }
  }

  // Gravar arquivo JSON massivo
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(processedFlashcards, null, 2), "utf8");

  console.log("-".repeat(80));
  console.log(`🎉 EXTRAÇÃO MASSIVA CONCLUÍDA!`);
  console.log(`- Linhas Inválidas Descartadas (isCorrectQ == 0): ${skippedInvalid}`);
  console.log(`- Flashcards Reais Normalizados Extraídos: ${processedFlashcards.length}`);
  console.log(`- Arquivo Gravado: ${OUTPUT_JSON_PATH} (${(fs.statSync(OUTPUT_JSON_PATH).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log("-".repeat(80));

  return processedFlashcards;
}

runMassIngestion().catch(console.error);
