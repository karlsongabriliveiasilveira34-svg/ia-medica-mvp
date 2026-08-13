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

      return {
        text: fullText,
        pages: numPages,
        pagesData: pagesData.length > 0 ? pagesData : [{ pageNumber: 1, text: fullText }]
      };
    }

    // Legacy pdf-parse function fallback
    const parseFn = typeof pdfPkg === "function" ? pdfPkg : (pdfPkg.default || pdfPkg);
    const data = await parseFn(buffer);

    return {
      text: data.text || "",
      pages: data.numpages || 1,
      pagesData: [{ pageNumber: 1, text: data.text || "" }]
    };
  } catch (err) {
    console.error("❌ Erro ao extrair texto do PDF:", err.message);
    throw err;
  }
}