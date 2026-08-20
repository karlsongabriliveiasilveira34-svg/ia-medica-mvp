import { query } from "../config/database.js";
import { SourceValidatorService } from "../services/source-validator.service.js";

/**
 * Retorna lista estruturada de todas as fontes oficiais catalogadas com contadores de chunks
 */
export async function handleListSources(req, res) {
  try {
    const { authorityLevel, validationStatus, organization, search } = req.query;

    let whereClause = "WHERE 1=1";
    const queryParams = [];
    let paramIdx = 1;

    if (authorityLevel) {
      whereClause += ` AND s.authority_level = $${paramIdx}`;
      queryParams.push(parseInt(authorityLevel, 10));
      paramIdx++;
    }

    if (validationStatus) {
      whereClause += ` AND s.validation_status = $${paramIdx}`;
      queryParams.push(validationStatus);
      paramIdx++;
    }

    if (organization) {
      whereClause += ` AND s.organization ILIKE $${paramIdx}`;
      queryParams.push(`%${organization}%`);
      paramIdx++;
    }

    if (search) {
      whereClause += ` AND (s.title ILIKE $${paramIdx} OR s.organization ILIKE $${paramIdx} OR s.condition ILIKE $${paramIdx})`;
      queryParams.push(`%${search}%`);
      paramIdx++;
    }

    const sql = `
      SELECT 
        s.id,
        s.source_id,
        s.title,
        s.organization,
        s.source_type,
        s.version,
        s.effective_date,
        s.url,
        s.canonical_url,
        s.doi,
        s.pmid,
        s.language,
        s.authority_level,
        s.evidence_level,
        s.validation_status,
        s.medical_area,
        s.condition,
        s.license,
        s.retrieved_at,
        s.updated_at,
        COUNT(DISTINCT d.id)::int as documents_count,
        COUNT(dc.id)::int as chunks_count
      FROM sources s
      LEFT JOIN documents d ON d.source_id = s.id
      LEFT JOIN document_chunks dc ON dc.document_id = d.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.authority_level ASC, s.effective_date DESC NULLS LAST, s.title ASC
    `;

    const result = await query(sql, queryParams);

    // Contadores por Status e Nível
    const statsResult = await query(`
      SELECT 
        validation_status,
        COUNT(*)::int as total
      FROM sources
      GROUP BY validation_status
    `);

    return res.status(200).json({
      status: "success",
      sources: result.rows,
      total: result.rows.length,
      stats: statsResult.rows
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao listar fontes oficiais catalogadas.",
      detail: error.message
    });
  }
}

/**
 * Registra uma nova fonte oficial validada
 */
export async function handleRegisterOfficialSource(req, res) {
  try {
    const { metadata, contentText } = req.body;
    if (!metadata) {
      return res.status(400).json({ status: "error", message: "Objeto 'metadata' é obrigatório." });
    }

    const result = await SourceValidatorService.registerOfficialSource({ metadata, contentText });
    return res.status(201).json({
      status: "success",
      message: result.action === "updated" ? "Fonte atualizada com sucesso." : "Nova fonte oficial aprovada e registrada.",
      source: result.source
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message
    });
  }
}

/**
 * Atualiza status de validação de uma fonte (approved, superseded, rejected)
 */
export async function handleUpdateSourceStatus(req, res) {
  try {
    const { id } = req.params;
    const { validationStatus } = req.body;

    const validStatuses = ["approved", "pending_review", "rejected", "superseded", "error"];
    if (!validStatuses.includes(validationStatus)) {
      return res.status(400).json({ status: "error", message: `Status inválido. Permitidos: ${validStatuses.join(", ")}` });
    }

    const updated = await query(
      `UPDATE sources SET validation_status = $1, status = CASE WHEN $1 = 'approved' THEN 'ACTIVE' ELSE 'INACTIVE' END, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [validationStatus, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Fonte não encontrada." });
    }

    return res.status(200).json({
      status: "success",
      message: `Status da fonte atualizado para '${validationStatus}'.`,
      source: updated.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao atualizar status da fonte.",
      detail: error.message
    });
  }
}

/**
 * Retorna página e trechos originais de um documento
 */
export async function handleGetSourcePage(req, res) {
  try {
    const { id, page } = req.params;

    const docRes = await query(
      `
        SELECT 
          d.id, d.title, d.filename, d.category, d.metadata,
          s.organization, s.doi, s.pmid, s.source_type, s.status, s.authority_level, s.canonical_url, s.url
        FROM documents d
        LEFT JOIN sources s ON s.id = d.source_id
        WHERE d.id = $1 OR d.filename = $1
      `,
      [id]
    );

    if (docRes.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Fonte/Documento médico não encontrado."
      });
    }

    const doc = docRes.rows[0];

    const chunksRes = await query(
      `
        SELECT id, content, chunk_index, page_number, section_title, subsection_title
        FROM document_chunks
        WHERE document_id = $1 AND page_number = $2
        ORDER BY chunk_index ASC
      `,
      [doc.id, parseInt(page, 10) || 1]
    );

    return res.status(200).json({
      status: "success",
      document: doc,
      requestedPage: parseInt(page, 10) || 1,
      chunks: chunksRes.rows,
      pdfUrl: `/knowledge/${encodeURIComponent(doc.filename)}#page=${page}`
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Falha ao carregar página da fonte.",
      detail: error.message
    });
  }
}
