import { query } from "../config/database.js";
import { createEmbedding } from "../services/embedding.service.js";
import { vectorToPg } from "../utils/vector.js";
import { rankAndDeduplicateEvidence } from "../services/evidence-ranker.service.js";
import { ExternalEvidenceService } from "../services/external-evidence.service.js";

export class RetrievalAgent {
  /**
   * Executa busca vetorial semântica no PostgreSQL via pgvector com suporte a filtros de metadados
   */
  static async searchVector(embedding, { limit = 20, filters = {}, auditTraceId = "TRACE-LOCAL" } = {}) {
    const pgVectorStr = vectorToPg(embedding);
    const norm = Math.sqrt(embedding.reduce((acc, v) => acc + v * v, 0)).toFixed(4);

    let whereClause = "WHERE (d.status = 'ACTIVE' OR d.status IS NULL) AND (s.validation_status != 'superseded' AND s.validation_status != 'rejected' OR s.validation_status IS NULL)";
    const queryParams = [pgVectorStr, limit];
    let paramIdx = 3;

    if (filters.category) {
      whereClause += ` AND (d.category ILIKE $${paramIdx} OR d.category = 'artigos' OR d.category = 'geral' OR d.category = 'diretrizes')`;
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
        d.authors as document_authors,
        d.publication_year as document_publication_year,
        COALESCE(s.organization, d.organization) as document_organization,
        d.status,
        s.source_type,
        s.organization,
        s.doi,
        s.pmid,
        s.authority_level,
        s.evidence_level,
        s.validation_status,
        s.canonical_url,
        s.version as source_version,
        1 - (dc.embedding <=> $1) as similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      LEFT JOIN sources s ON s.id = d.source_id
      ${whereClause}
      ORDER BY dc.embedding <=> $1 ASC
      LIMIT $2;
    `;

    console.log(`\n🔍 [AUDIT TRACE VECTOR SQL] ${auditTraceId}`);
    console.log(`   📐 Vetor de Consulta: Dimensões=${embedding.length}, Norma=${norm}`);
    console.log(`   🗄️ Query SQL: ORDER BY dc.embedding <=> $1 ASC LIMIT ${limit}`);

    const res = await query(sql, queryParams);
    
    console.log(`   📊 Resultados Vetoriais Brutos Recuperados (${res.rows.length}):`);
    res.rows.forEach((r, idx) => {
      console.log(`      [${idx + 1}] ID: ${r.document_id} | Título: "${r.document_title}" | Similaridade Cosseno: ${r.similarity.toFixed(4)}`);
    });

    return res.rows;
  }

  /**
   * Executa busca por palavras-chave (Full-Text Search) no PostgreSQL em Português
   */
  static async searchText(keywordsQuery, { limit = 20, filters = {}, auditTraceId = "TRACE-LOCAL" } = {}) {
    let whereClause = "WHERE to_tsvector('portuguese', dc.content) @@ plainto_tsquery('portuguese', $1) AND (d.status = 'ACTIVE' OR d.status IS NULL) AND (s.validation_status != 'superseded' AND s.validation_status != 'rejected' OR s.validation_status IS NULL)";
    const queryParams = [keywordsQuery, limit];
    let paramIdx = 3;

    if (filters.category) {
      whereClause += ` AND (d.category ILIKE $${paramIdx} OR d.category = 'artigos' OR d.category = 'geral' OR d.category = 'diretrizes')`;
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
        d.authors as document_authors,
        d.publication_year as document_publication_year,
        COALESCE(s.organization, d.organization) as document_organization,
        d.status,
        s.source_type,
        s.organization,
        s.doi,
        s.pmid,
        s.authority_level,
        s.evidence_level,
        s.validation_status,
        s.canonical_url,
        s.version as source_version,
        ts_rank_cd(to_tsvector('portuguese', dc.content), plainto_tsquery('portuguese', $1)) as rank
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      LEFT JOIN sources s ON s.id = d.source_id
      ${whereClause}
      ORDER BY rank DESC
      LIMIT $2;
    `;
    try {
      console.log(`\n🔎 [AUDIT TRACE FTS SQL] ${auditTraceId} | Query: "${keywordsQuery}"`);
      const res = await query(sql, queryParams);
      console.log(`   📊 Resultados FTS Recuperados (${res.rows.length})`);
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
      vectorSimilarity: entry.doc.similarity !== undefined && entry.doc.similarity !== null ? Number(entry.doc.similarity) : null,
      vectorRank: entry.vectorRank,
      textRank: entry.textRank
    }));
  }

  /**
   * Método principal da Pipeline: Híbrido RAG MEGA (500 Artigos Padrão / 1.500 Artigos na Pesquisa Profunda)
   * PostgreSQL + SciELO Brasil + NCBI PubMed + Cochrane Library + Openi NIH
   */
  static async retrieveHybrid({ queryText, expandedQuery, topK = 100, deepResearch = false, filters = {}, auditTraceId = "TRACE-HYBRID-MEGA" }) {
    const isDeep = Boolean(deepResearch);
    const modeLabel = isDeep ? "🚀🚀 [PESQUISA PROFUNDA - 1.500 ARTIGOS/LIVROS]" : "🔍 [BUSCA PADRÃO - 500 ARTIGOS/DADOS]";
    
    console.log(`\n================================================================================`);
    console.log(`${modeLabel} ${auditTraceId}`);
    console.log(`📌 Pergunta Original: "${queryText}"`);
    console.log(`📌 Pergunta Expandida: "${expandedQuery || queryText}"`);
    console.log(`================================================================================\n`);

    const embeddingText = expandedQuery || queryText;
    let embedding = null;
    try {
      embedding = await createEmbedding(embeddingText);
    } catch (embErr) {
      console.warn("⚠️ Aviso na geração de embedding para busca vetorial (usando busca FTS e externas):", embErr.message);
    }

    // Definir limites de busca paralela conforme o modo (500 artigos padrão vs 1.500 pesquisa profunda)
    const scieloLimit = isDeep ? 400 : 100;
    const pubMedLimit = isDeep ? 500 : 150;
    const cochraneLimit = isDeep ? 250 : 80;
    const openiLimit = isDeep ? 200 : 80;
    const postgresLimit = isDeep ? 150 : 90;
    const maxReturnedToLLM = isDeep ? 200 : 100;

    // Executar busca massiva simultânea em 500 a 1.500 fontes em paralelo
    const [vectorRes, textRes, scieloRes, pubMedRes, cochraneRes, openiRes] = await Promise.all([
      embedding ? this.searchVector(embedding, { limit: postgresLimit, filters, auditTraceId }).catch(err => {
        console.warn("⚠️ Aviso na busca vetorial:", err.message);
        return [];
      }) : Promise.resolve([]),
      this.searchText(expandedQuery || queryText, { limit: postgresLimit, filters, auditTraceId }),
      ExternalEvidenceService.searchSciELO(queryText, scieloLimit),
      ExternalEvidenceService.searchPubMed(expandedQuery || queryText, pubMedLimit),
      ExternalEvidenceService.searchCochraneReviews(expandedQuery || queryText, cochraneLimit),
      ExternalEvidenceService.searchOpeniBiomedicalImages(expandedQuery || queryText, openiLimit)
    ]);

    let fused = this.applyRRF(vectorRes, textRes);
    
    // Filtrar trechos com similaridade semântica coerente e abrangente (>= 0.35 para capturar máxima cobertura científica)
    const BASE_SIMILARITY_CUTOFF = 0.35;
    const topSimilarity = fused.length > 0 && fused[0].vectorSimilarity ? fused[0].vectorSimilarity : 0;
    const effectiveCutoff = topSimilarity > 0.60 ? Math.max(BASE_SIMILARITY_CUTOFF, topSimilarity - 0.35) : BASE_SIMILARITY_CUTOFF;

    const relevantFused = fused.filter(item => {
      if (item.vectorSimilarity !== null && item.vectorSimilarity !== undefined) {
        return item.vectorSimilarity >= effectiveCutoff;
      }
      return true;
    });

    let rankedEvidence = rankAndDeduplicateEvidence(relevantFused, topK).map(e => ({
      ...e,
      originType: "LOCAL_VALIDATED"
    }));

    // Integrar massivamente o acervo de 500 a 1.500 fontes de alta autoridade
    const combinedEvidence = [...rankedEvidence];
    [...cochraneRes, ...scieloRes, ...pubMedRes, ...openiRes].forEach(ext => {
      if (combinedEvidence.length < maxReturnedToLLM + 20) {
        if (!combinedEvidence.some(e => e.document_title === ext.document_title)) {
          combinedEvidence.push(ext);
        }
      }
    });

    console.log(`\n🎯 [AUDIT TRACE SUMMARY MEGA RAG] ${auditTraceId}`);
    console.log(`   Fontes Selecionadas e Ranqueadas para o LLM (${combinedEvidence.length}):`);
    combinedEvidence.forEach((c, idx) => {
      console.log(`   [Fonte ${idx + 1}] ID: ${c.document_id || c.id} | Título: "${c.document_title || c.title}" | Score Final: ${c.evidenceScore} | Sim: ${c.vectorSimilarity}`);
    });
    console.log(`--------------------------------------------------------------------------------\n`);

    return combinedEvidence.slice(0, maxReturnedToLLM);
  }
}
