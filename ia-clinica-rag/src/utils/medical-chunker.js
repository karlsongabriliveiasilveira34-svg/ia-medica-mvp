/**
 * Chunker Médico Semântico Estruturado
 * Preserva integridade de recomendações clínicas, seções, tabelas, números de página e offsets.
 */

export function chunkMedicalDocument(pagesData, { maxChunkSize = 2500, minChunkSize = 300, overlap = 200 } = {}) {
  const chunks = [];
  let globalOffset = 0;

  // Se pagesData for uma string simples (fallback), envolva como página única
  const pages = Array.isArray(pagesData) ? pagesData : [{ pageNumber: 1, text: pagesData }];

  for (const pageObj of pages) {
    const pageNumber = pageObj.pageNumber || 1;
    const pageText = pageObj.text || "";

    if (!pageText.trim()) continue;

    // Detectar linhas e cabeçalhos/seções potenciais
    const lines = pageText.split("\n");
    let currentSection = pageObj.section || "Geral";
    let currentSubSection = pageObj.subsection || "";
    let currentBuffer = [];
    let currentBufferLength = 0;
    let chunkStartOffset = globalOffset;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Padrão heurístico para detecção de Seções Médicas (títulos em MAIÚSCULAS, numerações como "1. Introdução", "DIRETRIZ", "TRATAMENTO")
      const isHeaderPattern = /^(?:[0-9]{1,2}\.|\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]{4,60}\b|DIRETRIZ|TRATAMENTO|DIAGNÓSTICO|POSOLOGIA|CONDUTA|SINAIS DE ALARME|RECOMENDAÇÃO|RECOMENDAÇÕES|TABELA|ALGORITMO)/i.test(trimmed);

      if (isHeaderPattern && trimmed.length < 80 && !trimmed.endsWith(".")) {
        if (currentBufferLength >= minChunkSize) {
          const content = currentBuffer.join("\n").trim();
          if (content.length > 0) {
            chunks.push({
              pageNumber,
              section: currentSection,
              subsection: currentSubSection,
              content,
              startOffset: chunkStartOffset,
              endOffset: chunkStartOffset + content.length
            });
          }
          currentBuffer = [];
          currentBufferLength = 0;
          chunkStartOffset = globalOffset + pageText.indexOf(trimmed);
        }

        if (/^[0-9]+\.[0-9]+/.test(trimmed) || trimmed.length < 35) {
          currentSubSection = trimmed;
        } else {
          currentSection = trimmed;
          currentSubSection = "";
        }
      }

      currentBuffer.push(line);
      currentBufferLength += line.length + 1;

      // Se estourar o tamanho máximo do chunk e o parágrafo terminou
      if (currentBufferLength >= maxChunkSize || (currentBufferLength >= maxChunkSize - overlap && (trimmed.endsWith(".") || trimmed.endsWith(";")))) {
        const content = currentBuffer.join("\n").trim();
        if (content.length > 0) {
          chunks.push({
            pageNumber,
            section: currentSection,
            subsection: currentSubSection,
            content,
            startOffset: chunkStartOffset,
            endOffset: chunkStartOffset + content.length
          });
        }

        // Manter overlap do final do buffer anterior
        const overlapLines = [];
        let accumulatedOverlap = 0;
        for (let j = currentBuffer.length - 1; j >= 0; j--) {
          overlapLines.unshift(currentBuffer[j]);
          accumulatedOverlap += currentBuffer[j].length;
          if (accumulatedOverlap >= overlap) break;
        }

        currentBuffer = overlapLines;
        currentBufferLength = accumulatedOverlap;
        chunkStartOffset = globalOffset + pageText.indexOf(currentBuffer[0] || "");
      }
    }

    // Gravar sobrou do buffer ao final da página
    if (currentBufferLength >= 50) {
      const content = currentBuffer.join("\n").trim();
      if (content.length > 0) {
        chunks.push({
          pageNumber,
          section: currentSection,
          subsection: currentSubSection,
          content,
          startOffset: chunkStartOffset,
          endOffset: chunkStartOffset + content.length
        });
      }
    }

    globalOffset += pageText.length + 1;
  }

  return chunks;
}
