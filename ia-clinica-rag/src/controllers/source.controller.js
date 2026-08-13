import { query } from "../config/database.js";

export async function handleGetSourcePage(req, res) {
  try {
    const { id, page } = req.params;

    const docRes = await query(
      `
        SELECT 
          d.id, d.title, d.filename, d.category, d.metadata,
          s.organization, s.doi, s.pmid, s.source_type, s.status
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
