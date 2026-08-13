import crypto from "crypto";
import { query } from "../config/database.js";
import { createEmbedding } from "./embedding.service.js";
import { chunkMedicalDocument } from "../utils/medical-chunker.js";
import { vectorToPg } from "../utils/vector.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ingestDocument({
  title,
  filename,
  category,
  text,
  pagesData = null,
  checksum = null,
  metadata = {}
}) {
  if (!checksum && text) {
    checksum = crypto.createHash("sha256").update(text).digest("hex");
  }

  // Criar ou mapear fonte associada no catálogo 'sources'
  let sourceId = null;
  try {
    const sourceRes = await query(
      `
        INSERT INTO sources (title, pdf_path, source_type, specialties, status)
        VALUES ($1, $2, $3, $4, 'ACTIVE')
        RETURNING id
      `,
      [title, filename, metadata.sourceType || "GUIDELINE", JSON.stringify([category])]
    );
    sourceId = sourceRes.rows[0]?.id || null;
  } catch (err) {
    console.warn("⚠️ Aviso ao registrar no catálogo de fontes:", err.message);
  }

  // Verificar se o documento com mesmo checksum ou filename já existe
  const existingDoc = await query(
    `SELECT id FROM documents WHERE filename = $1 OR checksum = $2`,
    [filename, checksum]
  );

  if (existingDoc.rows.length > 0) {
    console.log(`ℹ️ Documento '${filename}' já existe no banco. Atualizando vetores...`);
    await query(`DELETE FROM documents WHERE id = $1`, [existingDoc.rows[0].id]);
  }

  const documentResult = await query(
    `
      INSERT INTO documents
        (title, filename, category, checksum, source_id, metadata)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      title,
      filename,
      category,
      checksum,
      sourceId,
      JSON.stringify({
        ...metadata,
        publicationYear: metadata.publicationYear || new Date().getFullYear(),
        organization: metadata.organization || "Diretriz Médica"
      })
    ]
  );

  const documentId = documentResult.rows[0].id;
  
  // Utilizar o Chunker Médico Semântico com suporte a páginas e seções
  const inputForChunker = pagesData && pagesData.length > 0 ? pagesData : text;
  const chunks = chunkMedicalDocument(inputForChunker);

  console.log(`📄 Documento: ${title}`);
  console.log(`🧩 Chunks médicos semânticos a vetorizar: ${chunks.length}`);

  for (let i = 0; i < chunks.length; i++) {
    const chunkObj = chunks[i];
    const content = chunkObj.content;

    console.log(`⏳ Gerando embedding médico ${i + 1}/${chunks.length} (Página ${chunkObj.pageNumber})...`);
    
    if (i > 0) await sleep(250);

    const embedding = await createEmbedding(content);

    await query(
      `
        INSERT INTO document_chunks
        (
          document_id,
          content,
          chunk_index,
          embedding,
          page_number,
          section_title,
          subsection_title,
          start_offset,
          end_offset,
          metadata
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        documentId,
        content,
        i,
        vectorToPg(embedding),
        chunkObj.pageNumber || 1,
        chunkObj.section || "Geral",
        chunkObj.subsection || null,
        chunkObj.startOffset || 0,
        chunkObj.endOffset || content.length,
        JSON.stringify({
          source: filename,
          category,
          chunkIndex: i,
          totalChunks: chunks.length,
          pageNumber: chunkObj.pageNumber || 1,
          section: chunkObj.section,
          subsection: chunkObj.subsection,
          ...metadata
        })
      ]
    );
  }

  console.log(`✅ Ingestão estruturada concluída para '${title}' (${chunks.length} chunks com seções e páginas).`);

  return {
    documentId,
    title,
    filename,
    chunksCount: chunks.length
  };
}

export async function deleteDocument(documentId) {
  const result = await query(
    `DELETE FROM documents WHERE id = $1 RETURNING id, filename`,
    [documentId]
  );
  return result.rows[0] || null;
}

export async function listDocuments({ limit = 50, offset = 0 } = {}) {
  const result = await query(
    `
      SELECT 
        d.id,
        d.title,
        d.filename,
        d.category,
        d.checksum,
        d.metadata,
        d.created_at,
        COUNT(dc.id)::int as chunks_count
      FROM documents d
      LEFT JOIN document_chunks dc ON d.id = dc.document_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const countResult = await query(`SELECT COUNT(*)::int as total FROM documents`);

  return {
    documents: result.rows,
    total: countResult.rows[0].total,
    limit,
    offset
  };
}