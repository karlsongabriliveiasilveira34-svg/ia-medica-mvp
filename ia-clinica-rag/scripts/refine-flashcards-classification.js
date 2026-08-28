import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUMEDQ_JSON_FILE = path.resolve(__dirname, "../src/database/rumedq-dataset.json");

if (!fs.existsSync(RUMEDQ_JSON_FILE)) {
  console.error("Arquivo rumedq-dataset.json não encontrado!");
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(RUMEDQ_JSON_FILE, "utf8"));
console.log(`Carregados ${rawData.length} flashcards.`);

let counts = {
  cardio: 0,
  infecto: 0,
  pediatria: 0,
  go: 0,
  cirurgia: 0,
  preventiva: 0,
  farmaco: 0,
  nefro: 0,
  clinica: 0
};

const refined = rawData.map((card, idx) => {
  const text = `${card.front || ""} ${card.back || ""} ${card.topic || ""}`.toLowerCase();

  let deckId = "clinica";
  let subject = "Clínica Médica";

  // Classificação médica contextual baseada em termos diagnósticos e terapêuticos
  if (
    text.includes("ecg") || text.includes("eletrocardiograma") || text.includes("infarto") ||
    text.includes("coronária") || text.includes("arritmia") || text.includes("fibrilação") ||
    text.includes("insuficiência cardíaca") || text.includes("valvopatia") || text.includes("estenose aórtica") ||
    text.includes("miocardiopatia") || text.includes("troponina") || text.includes("angina") ||
    text.includes("hipertensão arterial") || text.includes("taquicardia") || text.includes("bradicardia")
  ) {
    deckId = "cardio";
    subject = "Cardiologia & ECG";
  } else if (
    text.includes("sepse") || text.includes("meningite") || text.includes("tuberculose") ||
    text.includes("hiv") || text.includes("aids") || text.includes("sífilis") ||
    text.includes("hepatite") || text.includes("pneumonia") || text.includes("antimicrobiano") ||
    text.includes("antibiótico") || text.includes("ceftriaxona") || text.includes("endocardite") ||
    text.includes("arbovirose") || text.includes("dengue") || text.includes("chikungunya") ||
    text.includes("bactéria") || text.includes("vírus") || text.includes("fungo")
  ) {
    deckId = "infecto";
    subject = "Infectologia & Antimicrobianos";
  } else if (
    text.includes("criança") || text.includes("pediatria") || text.includes("puericultura") ||
    text.includes("lactente") || text.includes("recém-nascido") || text.includes("neonatal") ||
    text.includes("kawasaki") || text.includes("bronquiolite") || text.includes("apgar") ||
    text.includes("desidratação infantil") || text.includes("pni") || text.includes("aleitamento")
  ) {
    deckId = "pediatria";
    subject = "Pediatria & Puericultura";
  } else if (
    text.includes("gestante") || text.includes("gestação") || text.includes("gravidez") ||
    text.includes("parto") || text.includes("pré-natal") || text.includes("cesariana") ||
    text.includes("útero") || text.includes("ovário") || text.includes("colo do útero") ||
    text.includes("pré-eclâmpsia") || text.includes("eclâmpsia") || text.includes("anticoncepção") ||
    text.includes("menopausa") || text.includes("sangramento uterino") || text.includes("ginecologia")
  ) {
    deckId = "go";
    subject = "Ginecologia & Obstetrícia";
  } else if (
    text.includes("trauma") || text.includes("atls") || text.includes("fratura") ||
    text.includes("apendicite") || text.includes("colecistite") || text.includes("hérnia") ||
    text.includes("abdome agudo") || text.includes("laparotomia") || text.includes("sutura") ||
    text.includes("queimadura") || text.includes("politraumatizado") || text.includes("choque hipovolêmico") ||
    text.includes("cirurgia") || text.includes("pré-operatório") || text.includes("pós-operatório")
  ) {
    deckId = "cirurgia";
    subject = "Cirurgia Geral & Trauma";
  } else if (
    text.includes("sus") || text.includes("lei 8.080") || text.includes("lei 8.142") ||
    text.includes("epidemiologia") || text.includes("incidência") || text.includes("prevalência") ||
    text.includes("mortalidade") || text.includes("letalidade") || text.includes("risco relativo") ||
    text.includes("estudo de coorte") || text.includes("caso-controle") || text.includes("bioética") ||
    text.includes("notificação compulsória") || text.includes("atenção primária")
  ) {
    deckId = "preventiva";
    subject = "Medicina Preventiva & SUS";
  } else if (
    text.includes("renal") || text.includes("nefro") || text.includes("creatinina") ||
    text.includes("proteinúria") || text.includes("hematúria") || text.includes("glomerulonefrite") ||
    text.includes("diálise") || text.includes("hiponatremia") || text.includes("hipercalemia") ||
    text.includes("distúrbio hidroeletrolítico") || text.includes("kdigo") || text.includes("acidose metabólica")
  ) {
    deckId = "nefro";
    subject = "Nefrologia & Distúrbios Hidroeletrolíticos";
  } else if (
    text.includes("posologia") || text.includes("dose") || text.includes("farmacocinética") ||
    text.includes("farmacodinâmica") || text.includes("intoxicação") || text.includes("antídoto") ||
    text.includes("interação medicamentosa") || text.includes("bloqueador") || text.includes("agonista")
  ) {
    deckId = "farmaco";
    subject = "Farmacologia Clínica & Terapêutica";
  }

  counts[deckId] = (counts[deckId] || 0) + 1;

  return {
    ...card,
    deckId,
    subject,
    deck_id: deckId
  };
});

fs.writeFileSync(RUMEDQ_JSON_FILE, JSON.stringify(refined, null, 2), "utf8");

console.log("\n📊 Distribuição Refinada dos Flashcards por Baralho:");
console.table(counts);
console.log(`\n✅ ${refined.length} flashcards reclassificados e salvos com sucesso!`);
