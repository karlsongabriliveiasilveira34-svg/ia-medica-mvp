import { query } from "../config/database.js";
import { createEmbedding } from "../services/embedding.service.js";
import { vectorToPg } from "../utils/vector.js";
import { rankAndDeduplicateEvidence } from "../services/evidence-ranker.service.js";
import { ExternalEvidenceService } from "../services/external-evidence.service.js";

export class RetrievalAgent {
  /**
   * Executa busca vetorial semântica no PostgreSQL via pgvector com suporte a filtros de metadados
   */
  static async searchVector(embedding, { limit = 20, filters = {} } = {}) {
    const pgVectorStr = vectorToPg(embedding);

    let whereClause = "WHERE (d.status = 'ACTIVE' OR d.status IS NULL)";
    const queryParams = [pgVectorStr, limit];
    let paramIdx = 3;

    if (filters.category) {
      whereClause += ` AND (d.category ILIKE $${paramIdx} OR d.category = 'artigos' OR d.category = 'geral')`;
      queryParams.push(filters.category);
      paramIdx++;
    }

    const sql = `
      SELECT 
        dc.id,
        dc.document_id,
        dc.content,
        dc.chunk_index,
        dc.page_number,
        dc.section_title,
        dc.subsection_title,
        dc.start_offset,
        dc.end_offset,
        dc.metadata,
        d.title as document_title,
        d.filename as document_filename,
        d.category as document_category,
        d.status,
        s.source_type,
        s.organization,
        s.doi,
        s.pmid,
        1 - (dc.embedding <=> $1) as similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      LEFT JOIN sources s ON s.id = d.source_id
      ${whereClause}
      ORDER BY dc.embedding <=> $1 ASC
      LIMIT $2;
    `;
    const res = await query(sql, queryParams);
    return res.rows;
  }

  /**
   * Executa busca por palavras-chave (Full-Text Search) no PostgreSQL em Português
   */
  static async searchText(keywordsQuery, { limit = 20, filters = {} } = {}) {
    let whereClause = "WHERE to_tsvector('portuguese', dc.content) @@ plainto_tsquery('portuguese', $1) AND (d.status = 'ACTIVE' OR d.status IS NULL)";
    const queryParams = [keywordsQuery, limit];
    let paramIdx = 3;

    if (filters.category) {
      whereClause += ` AND (d.category ILIKE $${paramIdx} OR d.category = 'artigos' OR d.category = 'geral')`;
      queryParams.push(filters.category);
      paramIdx++;
    }

    const sql = `
      SELECT 
        dc.id,
        dc.document_id,
        dc.content,
        dc.chunk_index,
        dc.page_number,
        dc.section_title,
        dc.subsection_title,
        dc.start_offset,
        dc.end_offset,
        dc.metadata,
        d.title as document_title,
        d.filename as document_filename,
        d.category as document_category,
        d.status,
        s.source_type,
        s.organization,
        s.doi,
        s.pmid,
        ts_rank_cd(to_tsvector('portuguese', dc.content), plainto_tsquery('portuguese', $1)) as rank
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      LEFT JOIN sources s ON s.id = d.source_id
      ${whereClause}
      ORDER BY rank DESC
      LIMIT $2;
    `;
    try {
      const res = await query(sql, queryParams);
      return res.rows;
    } catch (err) {
      console.warn("⚠️ AVISO na busca por texto FTS:", err.message);
      return [];
    }
  }

  /**
   * Aplica a fusão de ranqueamento recíproco (Reciprocal Rank Fusion - RRF)
   */
  static applyRRF(vectorResults, textResults, k = 60) {
    const scores = new Map();

    vectorResults.forEach((doc, rank) => {
      const id = doc.id;
      if (!scores.has(id)) {
        scores.set(id, { doc, rrfScore: 0, vectorRank: rank + 1, textRank: null });
      }
      const item = scores.get(id);
      item.rrfScore += 1 / (k + (rank + 1));
    });

    textResults.forEach((doc, rank) => {
      const id = doc.id;
      if (!scores.has(id)) {
        scores.set(id, { doc, rrfScore: 0, vectorRank: null, textRank: rank + 1 });
      }
      const item = scores.get(id);
      item.textRank = rank + 1;
      item.rrfScore += 1 / (k + (rank + 1));
    });

    const sorted = Array.from(scores.values()).sort((a, b) => b.rrfScore - a.rrfScore);

    return sorted.map(entry => ({
      ...entry.doc,
      rrfScore: Number(entry.rrfScore.toFixed(5)),
      vectorSimilarity: entry.doc.similarity ? Number(entry.doc.similarity.toFixed(4)) : null,
      vectorRank: entry.vectorRank,
      textRank: entry.textRank
    }));
  }

  /**
   * Método principal da Pipeline: Híbrido com PostgreSQL + PubMed/NCBI + Repositórios de Conhecimento IA
   */
  static async retrieveHybrid({ queryText, expandedQuery, topK = 5, filters = {} }) {
    console.log(`🔎 Executando Busca Híbrida Avançada (PostgreSQL + PubMed + Repositórios IA) para: "${queryText}"`);

    const embedding = await createEmbedding(expandedQuery || queryText);

    // Executar busca local (Postgres) e busca externa PubMed/NCBI em paralelo
    const [vectorRes, textRes, pubMedRes, repoRes] = await Promise.all([
      this.searchVector(embedding, { limit: topK * 4, filters }),
      this.searchText(expandedQuery || queryText, { limit: topK * 4, filters }),
      ExternalEvidenceService.searchPubMed(expandedQuery || queryText, 3),
      ExternalEvidenceService.searchKnowledgeBaseRepositories(queryText, 2)
    ]);

    let fused = this.applyRRF(vectorRes, textRes);
    let rankedEvidence = rankAndDeduplicateEvidence(fused, topK);

    // Integrar evidências do PubMed/NCBI e dos repositórios de IA Médica ao contexto final
    const combinedEvidence = [...rankedEvidence, ...pubMedRes, ...repoRes];

    console.log(`🎯 Encontrados ${combinedEvidence.length} trechos qualificados (Locais: ${rankedEvidence.length}, PubMed: ${pubMedRes.length}, Repositórios IA: ${repoRes.length}).`);
    return combinedEvidence.slice(0, topK + 3);
  }
}
