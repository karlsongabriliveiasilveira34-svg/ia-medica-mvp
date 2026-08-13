/**
 * Ranqueador de Autoridade da Evidência Médica (Evidence Authority Scorer)
 * Pontua cada trecho recuperado combinando:
 * 1. Relevância Semântica e Textual (RRF Score)
 * 2. Nível da Hierarquia de Evidências (Diretriz > Revisão Sistemática > Ensaio Clínico > Estudo Observacional)
 * 3. Status e Atualidade da Fonte (Fontes ativas/recentes ganham peso)
 * 4. Autoridade da Organização Emissora (Ex: Ministério da Saúde, SBC, AHA, ESC)
 */

const EVIDENCE_HIERARCHY_WEIGHTS = {
  GUIDELINE: 1.0,
  SYSTEMATIC_REVIEW: 0.95,
  META_ANALYSIS: 0.95,
  RCT: 0.85,
  COHORT: 0.70,
  CASE_CONTROL: 0.60,
  BOOK: 0.55,
  PROTOCOL: 0.90,
  EXPERT_OPINION: 0.40,
  GENERAL: 0.50
};

export function computeEvidenceScore(item) {
  // 1. Relevância RRF normalizada (0.0 a 0.4)
  const rrfWeight = Math.min((item.rrfScore || 0) * 10, 0.40);

  // 2. Tipo de Evidência / Hierarquia (0.0 a 0.35)
  const sourceType = (item.source_type || item.document_category || "GUIDELINE").toUpperCase();
  const hierarchyScore = (EVIDENCE_HIERARCHY_WEIGHTS[sourceType] || 0.50) * 0.35;

  // 3. Status da Fonte e Recência (0.0 a 0.15)
  const currentYear = new Date().getFullYear();
  const pubYear = item.metadata?.publicationYear || item.publication_year || currentYear;
  const ageYears = Math.max(0, currentYear - pubYear);
  const recencyScore = Math.max(0, 0.15 - (ageYears * 0.015));

  // 4. Status de Atividade (0.0 a 0.10)
  const statusScore = (item.status === "ACTIVE" || !item.status) ? 0.10 : 0.02;

  const totalScore = rrfWeight + hierarchyScore + recencyScore + statusScore;
  const normalizedScore = Math.min(1.0, Math.max(0.0, Number(totalScore.toFixed(4))));

  let evidenceLevel = "Baixa";
  if (normalizedScore >= 0.75) evidenceLevel = "Alta";
  else if (normalizedScore >= 0.55) evidenceLevel = "Moderada";
  else if (normalizedScore >= 0.35) evidenceLevel = "Limitada";

  return {
    compositeEvidenceScore: normalizedScore,
    evidenceLevel,
    breakdown: {
      rrfContribution: Number(rrfWeight.toFixed(4)),
      hierarchyContribution: Number(hierarchyScore.toFixed(4)),
      recencyContribution: Number(recencyScore.toFixed(4)),
      statusContribution: Number(statusScore.toFixed(4))
    }
  };
}

export function rankAndDeduplicateEvidence(chunks, topK = 5) {
  const map = new Map();

  for (const chunk of chunks) {
    const key = `${chunk.document_id}_${chunk.page_number || chunk.chunk_index}`;
    const evidenceData = computeEvidenceScore(chunk);
    const enriched = {
      ...chunk,
      evidenceScore: evidenceData.compositeEvidenceScore,
      evidenceLevel: evidenceData.evidenceLevel,
      scoreBreakdown: evidenceData.breakdown
    };

    if (!map.has(key) || map.get(key).evidenceScore < enriched.evidenceScore) {
      map.set(key, enriched);
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.evidenceScore - a.evidenceScore);
  return sorted.slice(0, topK);
}
