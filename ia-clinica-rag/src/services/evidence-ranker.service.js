/**
 * Ranqueador Multi-Fatorial de Autoridade da Evidência Médica (GRADE + Hierarquia de Fontes 1 a 5)
 * Combina:
 * 1. Similaridade Semântica e Textual (RRF Score: 35%)
 * 2. Nível de Autoridade da Fonte Oficial (Níveis 1 a 5: 30%)
 * 3. Nível de Evidência Científica (GRADE / Oxford CEBM: 20%)
 * 4. Recência e Status de Atualização (15%)
 */

export const AUTHORITY_WEIGHTS = {
  1: { weight: 1.00, label: "Nível 1 — Evidência de Alta Qualidade (Cochrane / Meta-análises)" },
  2: { weight: 0.90, label: "Nível 2 — Literatura Biomédica Internacional (PubMed/MEDLINE)" },
  3: { weight: 0.85, label: "Nível 3 — Literatura Científica Regional (SciELO Brasil / AL)" },
  4: { weight: 0.95, label: "Nível 4 — Diretrizes Oficiais (Ministério da Saúde / CONITEC / OMS / OPAS)" },
  5: { weight: 0.75, label: "Nível 5 — Guias Clínicos Complementares (MSF Clinical Guidelines)" }
};

export const EVIDENCE_HIERARCHY = {
  META_ANALYSIS: { weight: 1.00, grade: "Nível 1 (Meta-análise / Revisão Sistemática)", gradeCode: 1 },
  SYSTEMATIC_REVIEW: { weight: 0.98, grade: "Nível 1 (Revisão Sistemática Cochrane / PRISMA)", gradeCode: 1 },
  GUIDELINE: { weight: 0.95, grade: "Nível 2 (Diretriz Oficial de Sociedade / Ministério da Saúde)", gradeCode: 2 },
  RCT: { weight: 0.90, grade: "Nível 2 (Ensaio Clínico Randomizado - RCT)", gradeCode: 2 },
  COHORT: { weight: 0.75, grade: "Nível 3 (Estudo de Coorte Prospectivo/Retrospectivo)", gradeCode: 3 },
  CASE_CONTROL: { weight: 0.60, grade: "Nível 4 (Estudo Caso-Controle / Série de Casos)", gradeCode: 4 },
  EXPERT_OPINION: { weight: 0.45, grade: "Nível 5 (Opinião de Especialista / Consenso)", gradeCode: 5 },
  GENERAL: { weight: 0.65, grade: "Nível 3 (Literatura Médica Geral Indexada)", gradeCode: 3 }
};

export function computeEvidenceScore(item) {
  // 1. Similaridade Semântica / RRF (0.0 a 0.60 - PESO DOMINANTE)
  let semanticScore = 0;
  if (item.vectorSimilarity !== null && item.vectorSimilarity !== undefined) {
    // Cosseno pgvector (faixa típica de alta relevância: 0.65 a 1.0)
    semanticScore = Math.max(0, Math.min(1.0, (item.vectorSimilarity - 0.45) / 0.45)) * 0.60;
  } else {
    // Fallback RRF
    semanticScore = Math.min((item.rrfScore || 0.01) * 15, 0.60);
  }

  // 2. Nível de Autoridade da Instituição (0.0 a 0.20)
  let authLevel = item.authority_level || item.authorityLevel;
  if (!authLevel) {
    const org = (item.organization || item.document_organization || "").toLowerCase();
    const title = (item.title || item.document_title || "").toLowerCase();
    if (org.includes("cochrane") || title.includes("cochrane")) authLevel = 1;
    else if (org.includes("pubmed") || org.includes("ncbi") || title.includes("pubmed")) authLevel = 2;
    else if (org.includes("scielo") || title.includes("scielo")) authLevel = 3;
    else if (org.includes("ministério da saúde") || org.includes("conitec") || org.includes("oms") || org.includes("who") || org.includes("opas") || org.includes("paho")) authLevel = 4;
    else if (org.includes("msf") || org.includes("médecins sans frontières") || title.includes("msf")) authLevel = 5;
    else authLevel = 4;
  }

  const authConfig = AUTHORITY_WEIGHTS[authLevel] || AUTHORITY_WEIGHTS[4];
  const authorityScore = authConfig.weight * 0.20;

  // 3. Tipo de Evidência / Hierarquia GRADE (0.0 a 0.10)
  const sourceType = (item.source_type || item.document_category || "GUIDELINE").toUpperCase();
  const hierarchyConfig = EVIDENCE_HIERARCHY[sourceType] || EVIDENCE_HIERARCHY.GUIDELINE;
  const hierarchyScore = hierarchyConfig.weight * 0.10;

  // 4. Status da Fonte e Recência (0.0 a 0.10)
  const currentYear = new Date().getFullYear();
  const pubYear = item.metadata?.publicationYear || item.publication_year || item.document_publication_year || item.publicationYear || currentYear;
  const ageYears = Math.max(0, currentYear - pubYear);
  const recencyScore = Math.max(0, 0.10 - (ageYears * 0.008));

  // Aplicação de penalidade estrita de similaridade para eliminar falsos positivos
  let rawScore = semanticScore + authorityScore + hierarchyScore + recencyScore;
  if (item.vectorSimilarity !== null && item.vectorSimilarity !== undefined && item.vectorSimilarity < 0.65) {
    const penaltyRatio = Math.max(0.1, (item.vectorSimilarity - 0.40) / 0.25);
    rawScore *= penaltyRatio;
  }

  const normalizedScore = Math.min(1.0, Math.max(0.0, Number(rawScore.toFixed(4))));

  let evidenceLevel = "Moderada";
  if (normalizedScore >= 0.75) evidenceLevel = "Altíssima (Oficial / Nível 1)";
  else if (normalizedScore >= 0.55) evidenceLevel = "Alta (Diretriz / Nível 2)";
  else if (normalizedScore >= 0.35) evidenceLevel = "Moderada (Nível 3/4)";

  let rankingRationale = `Fonte ${authConfig.label} com relevância semântica calculada de ${(semanticScore * 100 / 0.60).toFixed(0)}%.`;

  return {
    compositeEvidenceScore: normalizedScore,
    evidenceLevel,
    authorityLevel: authLevel,
    authorityLabel: authConfig.label,
    gradeLevel: item.gradeLevel || hierarchyConfig.grade,
    gradeCode: hierarchyConfig.gradeCode,
    rankingRationale,
    pubYear,
    breakdown: {
      semanticRrfContribution: Number(semanticScore.toFixed(4)),
      authorityContribution: Number(authorityScore.toFixed(4)),
      gradeContribution: Number(hierarchyScore.toFixed(4)),
      recencyContribution: Number(recencyScore.toFixed(4))
    }
  };
}

export function rankAndDeduplicateEvidence(chunks, topK = 6) {
  const map = new Map();

  for (const chunk of chunks) {
    const key = `${chunk.document_id || chunk.id}_${chunk.page_number || chunk.chunk_index || 1}`;
    const evidenceData = computeEvidenceScore(chunk);
    const enriched = {
      ...chunk,
      organization: chunk.organization || chunk.document_organization || chunk.metadata?.organization || chunk.metadata?.sourceOrganization || null,
      document_organization: chunk.document_organization || chunk.organization || chunk.metadata?.organization || chunk.metadata?.sourceOrganization || null,
      canonical_url: chunk.canonical_url || chunk.url || chunk.metadata?.url || chunk.metadata?.canonicalUrl || null,
      evidenceScore: evidenceData.compositeEvidenceScore,
      evidenceLevel: evidenceData.evidenceLevel,
      authorityLevel: evidenceData.authorityLevel,
      authorityLabel: evidenceData.authorityLabel,
      gradeLevel: evidenceData.gradeLevel,
      gradeCode: evidenceData.gradeCode,
      rankingRationale: evidenceData.rankingRationale,
      pubYear: evidenceData.pubYear,
      scoreBreakdown: evidenceData.breakdown
    };

    if (!map.has(key) || map.get(key).evidenceScore < enriched.evidenceScore) {
      map.set(key, enriched);
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.evidenceScore - a.evidenceScore);
  return sorted.slice(0, topK);
}

/**
 * Ordenação por Maior Nível de Evidência (GRADE: Nível 1 > Nível 2 > Nível 3...)
 */
export function sortByEvidenceLevel(chunks) {
  return [...chunks].sort((a, b) => {
    const codeA = a.gradeCode || 3;
    const codeB = b.gradeCode || 3;
    if (codeA !== codeB) return codeA - codeB;
    return (b.evidenceScore || 0) - (a.evidenceScore || 0);
  });
}

/**
 * Ordenação por Mais Recente (Ano de Publicação)
 */
export function sortByRecency(chunks) {
  return [...chunks].sort((a, b) => {
    const yearA = Number.parseInt(a.pubYear || a.publication_year || a.document_publication_year || 0, 10);
    const yearB = Number.parseInt(b.pubYear || b.publication_year || b.document_publication_year || 0, 10);
    return yearB - yearA;
  });
}

/**
 * Ordenação por Maior Similaridade Semântica (RRF Score)
 */
export function sortBySimilarity(chunks) {
  return [...chunks].sort((a, b) => (b.rrfScore || 0) - (a.rrfScore || 0));
}
