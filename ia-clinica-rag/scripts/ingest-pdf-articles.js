import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { extractPdf } from "../src/utils/pdf.js";
import { ingestDocument } from "../src/services/document.service.js";

async function ingestUserPdfArticles() {
  const articlesDir = path.join(process.cwd(), "knowledge", "artigos");
  console.log("🚀 Priorizando a ingestão dos PDFs dos artigos do usuário em:", articlesDir);

  const files = await fs.readdir(articlesDir);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith(".pdf"));

  console.log(`📚 Encontrados ${pdfFiles.length} arquivos PDF em knowledge/artigos/`);

  for (let i = 0; i < pdfFiles.length; i++) {
    const filename = pdfFiles[i];
    const fullPath = path.join(articlesDir, filename);

    console.log(`\n========================================`);
    console.log(`📄 Ingerindo [PDF ${i + 1}/${pdfFiles.length}]: ${filename}`);

    try {
      const buffer = await fs.readFile(fullPath);
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      const pdfData = await extractPdf(buffer);
      const title = filename.replace(/\.pdf$/i, "").replaceAll("_", " ").replaceAll("-", " ");

      if (!pdfData.text || pdfData.text.trim().length < 50) {
        console.warn(`⚠️ Texto insuficiente no PDF ${filename}, ignorando.`);
        continue;
      }

      await ingestDocument({
        title,
        filename: `artigos/${filename}`,
        category: "artigos",
        text: pdfData.text,
        pagesData: pdfData.pagesData,
        checksum,
        metadata: {
          pages: pdfData.pages,
          sourceType: "ARTICLE",
          organization: "Artigo Médico"
        }
      });

      console.log(`✅ Sucesso: ${filename} ingerido no banco!`);
    } catch (err) {
      console.error(`❌ Erro ao ingerir ${filename}:`, err.message);
    }
  }

  console.log("\n========================================");
  console.log("✨ Ingestão de todos os PDFs do usuário concluída com sucesso!");
  console.log("========================================");
}

ingestUserPdfArticles().then(() => process.exit(0)).catch(err => {
  console.error("❌ Erro fatal na ingestão:", err);
  process.exit(1);
});
