import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeamento de termos MeSH para especialidades médicas em português
function mapMeshToSpecialty(meshes = []) {
  const meshStr = (meshes || []).join(" ").toLowerCase();
  if (meshStr.includes("cardio") || meshStr.includes("heart") || meshStr.includes("vascular") || meshStr.includes("hypertension")) return { area: "clinica", deckId: "cardio", espName: "Cardiologia" };
  if (meshStr.includes("infect") || meshStr.includes("virus") || meshStr.includes("bacteri") || meshStr.includes("hiv") || meshStr.includes("sepsis")) return { area: "clinica", deckId: "infecto", espName: "Infectologia" };
  if (meshStr.includes("kidney") || meshStr.includes("renal") || meshStr.includes("nephr")) return { area: "clinica", deckId: "nefro", espName: "Nefrologia" };
  if (meshStr.includes("drug") || meshStr.includes("pharmac") || meshStr.includes("therapy") || meshStr.includes("dose")) return { area: "clinica", deckId: "farmaco", espName: "Farmacologia" };
  if (meshStr.includes("pediatr") || meshStr.includes("child") || meshStr.includes("infant") || meshStr.includes("adolescent")) return { area: "pediatria", deckId: "pediatria", espName: "Pediatria" };
  if (meshStr.includes("pregnan") || meshStr.includes("obstetr") || meshStr.includes("gynecol") || meshStr.includes("uter") || meshStr.includes("fetal")) return { area: "go", deckId: "go", espName: "Ginecologia e Obstetrícia" };
  if (meshStr.includes("surg") || meshStr.includes("trauma") || meshStr.includes("wound") || meshStr.includes("abdom")) return { area: "cirurgia", deckId: "cirurgia", espName: "Cirurgia Geral" };
  if (meshStr.includes("public health") || meshStr.includes("epidemiol") || meshStr.includes("prevent") || meshStr.includes("health policy")) return { area: "preventiva", deckId: "preventiva", espName: "Medicina Preventiva & SUS" };
  return { area: "clinica", deckId: "cardio", espName: "Clínica Médica" };
}

export class PubMedQAIngestionService {
  static async ingestData(limit = 200) {
    const jsonPath = path.join(__dirname, "../../knowledge/artigos/pubmedqa/data/ori_pqal.json");
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[PUBMEDQA] Arquivo não encontrado em ${jsonPath}`);
      return { ingestedQuestions: 0, ingestedCards: 0 };
    }

    try {
      const rawData = fs.readFileSync(jsonPath, "utf-8");
      const pubmedObj = JSON.parse(rawData);
      const pmidKeys = Object.keys(pubmedObj).slice(0, limit);

      console.log(`[PUBMEDQA] Iniciando ingestão de ${pmidKeys.length} registros clínicos reais...`);

      let ingestedQuestions = 0;
      let ingestedCards = 0;

      for (const pmid of pmidKeys) {
        const item = pubmedObj[pmid];
        const questionText = item.QUESTION || "";
        const contexts = (item.CONTEXTS || []).join("\n\n");
        const longAnswer = item.LONG_ANSWER || "";
        const finalDecision = item.final_decision || "yes"; // 'yes', 'no', 'maybe'
        const meshes = item.MESHES || [];
        const year = item.YEAR || "2023";

        const { area, deckId, espName } = mapMeshToSpecialty(meshes);

        // 1. Criar Flashcard de Evidência Clínica
        const cardFront = `[PubMed PMID ${pmid}] ${questionText}`;
        const cardBack = `${longAnswer}\n\nConclusão Científica: ${finalDecision.toUpperCase()} (Ano: ${year})\nÁrea: ${espName}`;
        
        try {
          await pool.query(
            `INSERT INTO flashcards (deck_id, area, frente, verso, dica) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT DO NOTHING`,
            [deckId, area, cardFront, cardBack, `Descritores MeSH: ${meshes.slice(0, 3).join(", ")}`]
          );
          ingestedCards++;
        } catch (e) {
          // Erro silencioso em caso de pool inativo
        }

        // 2. Criar Questão de Simulado Baseada em Evidências
        const correctOpt = finalDecision === "yes" 
          ? "Sim, as evidências clínicas e ensaios confirmam correlação e eficácia demonstrada."
          : (finalDecision === "no" 
              ? "Não, os ensaios clínicos demonstraram ausência de significância estatística ou efeito deletério." 
              : "Parcialmente / Incerto, as evidências atuais são controversas e demandam maiores ensaios controlados.");

        const distrator1 = "A correlação é contraindicada em todas as diretrizes de primeiro nível devido a risco cardiovascular elevado.";
        const distrator2 = "Os resultados foram inconclusivos unicamente pela falta de amostragem pediátrica em fase III.";
        const distrator3 = "O desfecho primário foi invalidado por viés de seleção metodológica nos centros participantes.";

        const alternativas = [correctOpt, distrator1, distrator2, distrator3];
        const correctIndex = 0;

        const enunciado = `[PubMed Evidence-Based Medicine — PMID ${pmid}]\n${contexts ? contexts.slice(0, 400) + "...\n\n" : ""}${questionText}`;
        const explicacao = `Resolução Baseada em Evidências (PubMed ${year}):\n${longAnswer}\n\nConclusão Oficial: ${finalDecision.toUpperCase()}.\nÁrea Temática: ${espName}.`;

        try {
          await pool.query(
            `INSERT INTO questoes (banca, especialidade, tema, dificuldade, enunciado, alternativas, resposta_correta, explicacao)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT DO NOTHING`,
            [
              `PubMed / EBM ${year}`,
              area,
              espName,
              "medio",
              enunciado,
              JSON.stringify(alternativas),
              correctIndex,
              explicacao
            ]
          );
          ingestedQuestions++;
        } catch (e) {
          // Erro silencioso em caso de pool inativo
        }
      }

      console.log(`[PUBMEDQA] ✅ Ingestão concluída com sucesso: ${ingestedQuestions} questões e ${ingestedCards} flashcards inseridos.`);
      return { ingestedQuestions, ingestedCards };
    } catch (err) {
      console.error("[PUBMEDQA] Erro ao processar ingestão:", err.message);
      return { ingestedQuestions: 0, ingestedCards: 0 };
    }
  }
}
