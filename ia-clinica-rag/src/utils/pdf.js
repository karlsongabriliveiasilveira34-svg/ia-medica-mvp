import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfPkg = require("pdf-parse");

export async function extractPdf(filePathOrBuffer) {
  const buffer = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer
    : await fs.readFile(filePathOrBuffer);

  try {
    // pdf-parse v2.x (PDFParse class)
    if (pdfPkg.PDFParse || (pdfPkg.default && pdfPkg.default.PDFParse)) {
      const PDFClass = pdfPkg.PDFParse || pdfPkg.default.PDFParse;
      const parser = new PDFClass({ data: buffer });
      await parser.load();

      const textRes = await parser.getText();
      const infoRes = await parser.getInfo().catch(() => ({}));
      const numPages = infoRes.numpages || textRes.total || textRes.pages?.length || 1;

      const rawInfo = infoRes?.info || infoRes || {};
      const fullText = textRes.text || (typeof textRes === "string" ? textRes : "");

      const pagesData = [];
      if (textRes.pages && Array.isArray(textRes.pages)) {
        textRes.pages.forEach((p, idx) => {
          pagesData.push({
            pageNumber: idx + 1,
            text: typeof p === "string" ? p : p.text || ""
          });
        });
      }

      if (pagesData.length === 0 && fullText) {
        const rawPages = fullText.split(/\f|\n--- \d+ of \d+ ---\n|\n--- Page \d+ ---\n/);
        rawPages.forEach((pText, i) => {
          pagesData.push({
            pageNumber: i + 1,
            text: pText
          });
        });
      }

      const extractedMetadata = parsePdfMetadata(fullText, rawInfo);

      return {
        text: fullText,
        pages: numPages,
        pagesData: pagesData.length > 0 ? pagesData : [{ pageNumber: 1, text: fullText }],
        metadata: extractedMetadata
      };
    }

    // Legacy pdf-parse function fallback
    const parseFn = typeof pdfPkg === "function" ? pdfPkg : (pdfPkg.default || pdfPkg);
    const data = await parseFn(buffer);
    const fullText = data.text || "";
    const rawInfo = data.info || {};
    const extractedMetadata = parsePdfMetadata(fullText, rawInfo);

    return {
      text: fullText,
      pages: data.numpages || 1,
      pagesData: [{ pageNumber: 1, text: fullText }],
      metadata: extractedMetadata
    };
  } catch (err) {
    console.error("❌ Erro ao extrair texto do PDF:", err.message);
    throw err;
  }
}

function parsePdfMetadata(fullText, info = {}) {
  let title = null;
  let authors = null;
  let publicationYear = null;
  let organization = null;

  // 1. Extrair Ano
  if (info.CreationDate) {
    const yearMatch = info.CreationDate.match(/(?:D:)?(19\d\d|20[0-2]\d)/);
    if (yearMatch) publicationYear = parseInt(yearMatch[1], 10);
  }
  if (!publicationYear && fullText) {
    const textSnippet = fullText.substring(0, 3000);
    const yearMatch = textSnippet.match(/(?:©|copyright|publicad[oa]\s+em|ano|brasília[^\n]*|edição[^\n]*)\s*(19[89]\d|20[0-2]\d)/i) ||
                      textSnippet.match(/\b(19[89]\d|20[0-2]\d)\b/);
    if (yearMatch) {
      const yr = parseInt(yearMatch[1], 10);
      if (yr >= 1970 && yr <= 2026) publicationYear = yr;
    }
  }

  // 2. Extrair Organização
  if (fullText) {
    const topText = fullText.substring(0, 2000).toLowerCase();
    if (topText.includes("ministério da saúde")) {
      organization = "Ministério da Saúde";
    } else if (topText.includes("sociedade brasileira de cardiologia")) {
      organization = "Sociedade Brasileira de Cardiologia";
    } else if (topText.includes("organização mundial da saúde") || topText.includes("world health organization")) {
      organization = "Organização Mundial da Saúde (OMS)";
    } else if (topText.includes("conitec")) {
      organization = "CONITEC";
    } else if (info.Producer || info.Creator) {
      const prod = info.Producer || info.Creator;
      if (typeof prod === "string" && prod.length < 60 && !prod.includes("PDF") && !prod.includes("Acrobat")) {
        organization = prod.trim();
      }
    }
  }

  // 3. Extrair Autor(es)
  if (info.Author && typeof info.Author === "string" && info.Author.trim().length > 2 && !info.Author.toLowerCase().includes("untitled")) {
    authors = [info.Author.trim()];
  } else if (fullText) {
    const topText = fullText.substring(0, 2500);
    const authorMatch = topText.match(/(?:autores?|por|authors?):\s*([^\n\r]+)/i);
    if (authorMatch && authorMatch[1].trim().length > 3) {
      authors = [authorMatch[1].trim()];
    }
  }

  // 4. Extrair Título Real
  if (info.Title && typeof info.Title === "string" && info.Title.trim().length > 4 && !info.Title.toLowerCase().startsWith("artigo") && !info.Title.toLowerCase().includes("untitled")) {
    title = info.Title.trim();
  }

  if (!title && fullText) {
    const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const candidateLines = [];

    for (let i = 0; i < Math.min(25, lines.length); i++) {
      const line = lines[i];
      if (line.includes("-- ") || line.match(/^[0-9]+$/) || line.toLowerCase().includes("ministério da saúde") || line.toLowerCase().includes("brasília")) {
        continue;
      }
      if (line.length >= 8 && line.length <= 100) {
        candidateLines.push(line);
        if (candidateLines.length >= 3) break;
      }
    }

    if (candidateLines.length > 0) {
      title = candidateLines.join(" ");
    }
  }

  return {
    title: title || null,
    authors: authors || null,
    publicationYear: publicationYear || null,
    organization: organization || null
  };
}