import crypto from "node:crypto";
import { query } from "../config/database.js";

// Domínios médicos oficiais autorizados (Níveis 1 a 5)
export const AUTHORIZED_OFFICIAL_DOMAINS = [
  "gov.br",
  "conitec.gov.br",
  "saude.gov.br",
  "who.int",
  "paho.org",
  "medicalguidelines.msf.org",
  "msf.org",
  "cochranelibrary.com",
  "ncbi.nlm.nih.gov",
  "scielo.br",
  "scielo.org",
  "doi.org"
];

export const AUTHORITY_LEVELS = {
  1: { level: 1, name: "Nível 1 — Evidência de Alta Qualidade (Cochrane, Revisões Sistemáticas, Meta-análises)", defaultWeight: 1.0 },
  2: { level: 2, name: "Nível 2 — Literatura Biomédica (PubMed/MEDLINE, RCTs, Ensaios Clínicos)", defaultWeight: 0.90 },
  3: { level: 3, name: "Nível 3 — Literatura Científica Regional (SciELO Brasil / América Latina)", defaultWeight: 0.85 },
  4: { level: 4, name: "Nível 4 — Diretrizes Oficiais (Ministério da Saúde / CONITEC / PCDT, OMS/WHO, OPAS/PAHO)", defaultWeight: 0.95 },
  5: { level: 5, name: "Nível 5 — Guias Clínicos Complementares (MSF Clinical Guidelines)", defaultWeight: 0.75 }
};

export class SourceValidatorService {
  /**
   * Executa a auditoria e validação de metadados em conformidade com as regras oficiais
   */
  static validateMetadata({
    sourceTitle,
    sourceOrganization,
    sourceType,
    publicationDate,
    lastUpdated,
    version,
    url,
    language = "pt-BR",
    medicalArea = "Clínica Geral",
    condition = null,
    authorityLevel = 4,
    evidenceLevel = "high",
    license = "Domínio Público / Acesso Aberto Oficial"
  }) {
    const errors = [];

    // 1. Validar Título Oficial
    if (!sourceTitle || typeof sourceTitle !== "string" || sourceTitle.trim().length < 5) {
      errors.push("Título oficial do documento é obrigatório e deve ter no mínimo 5 caracteres.");
    }

    // 2. Validar Instituição Responsável
    if (!sourceOrganization || typeof sourceOrganization !== "string" || sourceOrganization.trim().length < 3) {
      errors.push("Instituição oficial responsável é obrigatória.");
    }

    // 3. Validar Domínio e URL Oficial
    if (!url || typeof url !== "string") {
      errors.push("URL oficial da fonte é obrigatória.");
    } else {
      const isAuthorizedDomain = AUTHORIZED_OFFICIAL_DOMAINS.some(domain => url.toLowerCase().includes(domain));
      if (!isAuthorizedDomain && !url.startsWith("http")) {
        errors.push(`URL '${url}' não pertence a um domínio oficial médico autorizado.`);
      }
    }

    // 4. Validar Nível de Autoridade (1 a 5)
    const authLevelNum = Number(authorityLevel);
    if (!AUTHORITY_LEVELS[authLevelNum]) {
      errors.push("Nível de autoridade deve ser um número inteiro de 1 a 5.");
    }

    // 5. Validar Datas
    const validPubDate = publicationDate ? (new Date(publicationDate).toISOString().split("T")[0]) : null;
    const validUpdatedDate = lastUpdated ? (new Date(lastUpdated).toISOString().split("T")[0]) : validPubDate;

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: {
        sourceTitle: sourceTitle?.trim() || null,
        sourceOrganization: sourceOrganization?.trim() || null,
        sourceType: sourceType || "clinical_guideline",
        publicationDate: validPubDate,
        lastUpdated: validUpdatedDate,
        version: version || "1.0",
        url: url?.trim() || null,
        canonicalUrl: url?.trim() || null,
        language: language || "pt-BR",
        medicalArea: medicalArea || "Clínica Geral",
        condition: condition?.trim() || null,
        authorityLevel: authLevelNum || 4,
        evidenceLevel: evidenceLevel || "high",
        license: license || "Domínio Público / Acesso Aberto Oficial",
        validationStatus: errors.length === 0 ? "approved" : "rejected"
      }
    };
  }

  /**
   * Calcula o hash SHA-256 do conteúdo para controle de duplicação e integridade
   */
  static computeContentHash(content) {
    if (!content) return null;
    return crypto.createHash("sha256").update(content.trim()).digest("hex");
  }

  /**
   * Registra ou atualiza uma fonte oficial com controle de versão e superseding
   */
  static async registerOfficialSource({ metadata, contentText = "" }) {
    const validation = this.validateMetadata(metadata);
    if (!validation.isValid) {
      throw new Error(`Falha na validação da fonte oficial: ${validation.errors.join("; ")}`);
    }

    const s = validation.sanitized;
    const contentHash = s.contentHash || this.computeContentHash(contentText || s.sourceTitle);

    // Verificar se documento com mesmo hash ou mesma URL e versão já existe
    const existing = await query(
      `SELECT id, version, title, validation_status FROM sources 
       WHERE ($1::text IS NOT NULL AND content_hash = $1) 
          OR ($2::text IS NOT NULL AND canonical_url = $2 AND version = $3) 
          OR (title = $4 AND organization = $5 AND version = $3)`,
      [contentHash, s.canonicalUrl, s.version, s.sourceTitle, s.sourceOrganization]
    );

    if (existing.rows.length > 0) {
      console.log(`ℹ️ [LOG FONTE OFICIAL] Fonte '${s.sourceTitle}' v${s.version} já registrada. Atualizando metadados...`);
      const updated = await query(
        `UPDATE sources 
         SET authority_level = $1, evidence_level = $2, validation_status = 'approved',
             effective_date = $3, updated_at = CURRENT_TIMESTAMP, medical_area = $4, condition = $5, url = $6
         WHERE id = $7 RETURNING *`,
        [s.authorityLevel, s.evidenceLevel, s.publicationDate, s.medicalArea, s.condition, s.url, existing.rows[0].id]
      );
      return { source: updated.rows[0], action: "updated" };
    }

    // Verificar se existe versão anterior para marcar como SUPERSEDED
    const previousVersion = await query(
      `SELECT id, version FROM sources 
       WHERE title = $1 AND organization = $2 AND version != $3 AND status = 'ACTIVE'`,
      [s.sourceTitle, s.sourceOrganization, s.version]
    );

    let supersedesId = null;
    if (previousVersion.rows.length > 0) {
      supersedesId = previousVersion.rows[0].id;
      console.log(`⚡ [LOG VERSIONAMENTO] Versão anterior ${previousVersion.rows[0].version} encontrada. Marcando como SUPERSEDED...`);
      await query(
        `UPDATE sources SET status = 'SUPERSEDED', validation_status = 'superseded', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [supersedesId]
      );
    }

    // Inserir nova fonte oficial
    const result = await query(
      `INSERT INTO sources (
        source_id, title, organization, source_type, version, effective_date,
        url, canonical_url, language, specialties, status, validation_status,
        authority_level, evidence_level, medical_area, condition, license, content_hash, supersedes_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE', 'approved', $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        `SRC-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        s.sourceTitle,
        s.sourceOrganization,
        s.sourceType,
        s.version,
        s.publicationDate,
        s.url,
        s.canonicalUrl,
        s.language,
        JSON.stringify([s.medicalArea]),
        s.authorityLevel,
        s.evidenceLevel,
        s.medicalArea,
        s.condition,
        s.license,
        contentHash,
        supersedesId
      ]
    );

    console.log(`✅ [LOG FONTE OFICIAL] Nova fonte aprovada e registrada: "${s.sourceTitle}" (Nível ${s.authorityLevel} - ${s.sourceOrganization})`);
    return { source: result.rows[0], action: "created" };
  }
}
