import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDMCQA_FILE = path.resolve(__dirname, "../src/database/medmcqa-dataset.json");
const RUMEDQ_FILE = path.resolve(__dirname, "../src/database/rumedq-dataset.json");

const medmcqa = fs.existsSync(MEDMCQA_FILE) ? JSON.parse(fs.readFileSync(MEDMCQA_FILE, "utf8")) : [];
console.log(`Carregadas ${medmcqa.length} questões MedMCQA.`);

// Mapeamento de Especialidades para Decks Oficiais da Residência
const mapSubjectToDeck = (subject, question, topic) => {
  const text = `${subject || ""} ${topic || ""} ${question || ""}`.toLowerCase();

  if (
    text.includes("cardio") || text.includes("ecg") || text.includes("coronary") || text.includes("infarct") ||
    text.includes("heart") || text.includes("arrhythmia") || text.includes("hypertension") || text.includes("stemi") ||
    text.includes("angina") || text.includes("troponin") || text.includes("valvular")
  ) {
    return { deckId: "cardio", subject: "Cardiologia & ECG", area: "clinica" };
  }

  if (
    text.includes("infect") || text.includes("microbiol") || text.includes("antibiotic") || text.includes("tuberculosis") ||
    text.includes("hiv") || text.includes("sepsis") || text.includes("meningit") || text.includes("malaria") ||
    text.includes("virus") || text.includes("bacteri") || text.includes("fungal") || text.includes("hepatitis")
  ) {
    return { deckId: "infecto", subject: "Infectologia & Antimicrobianos", area: "clinica" };
  }

  if (
    text.includes("pediatr") || text.includes("child") || text.includes("infant") || text.includes("neonate") ||
    text.includes("puericultura") || text.includes("kawasaki") || text.includes("criança") || text.includes("lactente")
  ) {
    return { deckId: "pediatria", subject: "Pediatria & Puericultura", area: "pediatria" };
  }

  if (
    text.includes("gynae") || text.includes("obstet") || text.includes("pregnan") || text.includes("uter") ||
    text.includes("ovary") || text.includes("cervix") || text.includes("gestat") || text.includes("contracept") ||
    text.includes("preeclampsia") || text.includes("parto") || text.includes("cesárea")
  ) {
    return { deckId: "go", subject: "Ginecologia & Obstetrícia", area: "go" };
  }

  if (
    text.includes("surg") || text.includes("trauma") || text.includes("fracture") || text.includes("appendic") ||
    text.includes("cholecyst") || text.includes("hernia") || text.includes("burn") || text.includes("wound") ||
    text.includes("orthopaed") || text.includes("cirurgia")
  ) {
    return { deckId: "cirurgia", subject: "Cirurgia Geral & Trauma", area: "cirurgia" };
  }

  if (
    text.includes("prevent") || text.includes("social med") || text.includes("epidemiol") || text.includes("sus") ||
    text.includes("vaccin") || text.includes("mortalit") || text.includes("screening") || text.includes("bioethic")
  ) {
    return { deckId: "preventiva", subject: "Medicina Preventiva & SUS", area: "preventiva" };
  }

  if (
    text.includes("nephro") || text.includes("renal") || text.includes("kidney") || text.includes("glomerul") ||
    text.includes("creatinine") || text.includes("hyponatrem") || text.includes("hyperkalem") || text.includes("dialysis")
  ) {
    return { deckId: "nefro", subject: "Nefrologia & Distúrbios Hidroeletrolíticos", area: "clinica" };
  }

  if (
    text.includes("pharmaco") || text.includes("drug") || text.includes("dose") || text.includes("receptor") ||
    text.includes("toxicity") || text.includes("antidote") || text.includes("mechanism of action")
  ) {
    return { deckId: "farmaco", subject: "Farmacologia Clínica & Terapêutica", area: "clinica" };
  }

  return { deckId: "clinica", subject: "Clínica Médica", area: "clinica" };
};

const flashcards = [];
const deckStats = {
  cardio: 0,
  infecto: 0,
  pediatria: 0,
  go: 0,
  cirurgia: 0,
  preventiva: 0,
  nefro: 0,
  farmaco: 0,
  clinica: 0
};

// 1. Converter conceitos de alto rendimento do MedMCQA em Flashcards de Residência Médica
medmcqa.forEach((q, idx) => {
  const { deckId, subject, area } = mapSubjectToDeck(q.subject, q.question, q.topic);
  
  const correctOpt = q.options && q.options[q.correct] ? q.options[q.correct] : "Resposta clínica correta";
  const explanation = q.explanation && q.explanation.trim().length > 10 
    ? q.explanation.trim() 
    : `A conduta e conceito padrão-ouro para este quadro é: ${correctOpt}.`;

  const front = `💡 Conceito de Fixação [${q.topic || subject}]:\n\n${q.question}`;
  const back = `✅ Resposta & Conduta Médica:\n${correctOpt}\n\n📌 Racional Clínico / Diretriz:\n${explanation}\n\n📚 Especialidade de Residência: ${subject}`;

  const hash = crypto.createHash("sha256").update(front + back).digest("hex");

  const card = {
    id: `card_${deckId}_${idx + 1}`,
    front,
    back,
    deckId,
    deck_id: deckId,
    subject,
    especialidade: subject,
    area,
    topic: q.topic || subject,
    tema: q.topic || subject,
    difficulty: q.difficulty || "media",
    dificuldade: q.difficulty || "media",
    source: "MedIA Core / MedMCQA & Diretrizes de Residência",
    sourceUrl: "https://github.com/medmcqa/medmcqa",
    language: "pt-BR",
    hash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  flashcards.push(card);
  deckStats[deckId] = (deckStats[deckId] || 0) + 1;
});

fs.writeFileSync(RUMEDQ_FILE, JSON.stringify(flashcards, null, 2), "utf8");

console.log("\n================================================================================");
console.log("🩺 GERAÇÃO CONCLUÍDA: ACERVO MASSIVO DE FLASHCARDS POR ESPECIALIDADE");
console.log("================================================================================");
console.log(`Total de Flashcards Gerados: ${flashcards.length}`);
console.table(deckStats);
console.log("================================================================================\n");
