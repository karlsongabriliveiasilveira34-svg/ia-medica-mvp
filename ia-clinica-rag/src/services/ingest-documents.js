import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

import { extractPdf } from "../utils/pdf.js";
import { ingestDocument } from "./document.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.join(__dirname, "../../knowledge");

async function ensureFoldersExist() {
  const folders = ["artigos", "diretrizes", "protocolos"];
  for (const folder of folders) {
    const p = path.join(knowledgePath, folder);
    await fs.mkdir(p, { recursive: true });
  }
}

async function walk(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      // Ignorar pasta .git para economizar processamento
      if (entry.name === ".git") continue;

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walk(fullPath)));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  } catch (error) {
    return [];
  }
}

export async function runIngestion() {
  await ensureFoldersExist();

  console.log("🔍 Escaneando documentos (PDF, MD, TXT) na base de conhecimento:", knowledgePath);
  const files = await walk(knowledgePath);

  const validFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".pdf" || ext === ".md" || ext === ".txt";
  });

  console.log(`📚 Arquivos de conhecimento encontrados: ${validFiles.length}`);

  if (validFiles.length === 0) {
    console.log("ℹ️ Nenhum arquivo encontrado em 'knowledge/'.");
    return;
  }

  for (const file of validFiles) {
    try {
      const ext = path.extname(file).toLowerCase();
      const filename = path.basename(file);
      const relative = path.relative(knowledgePath, file);
      const category = relative.split(path.sep)[0] || "geral";
      const title = filename.replace(/\.(pdf|md|txt)$/i, "").replace(/_/g, " ").replace(/-/g, " ");

      const buffer = await fs.readFile(file);
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      let textContent = "";
      let pageCount = 1;

      if (ext === ".pdf") {
        const pdfData = await extractPdf(file);
        textContent = pdfData.text;
        pageCount = pdfData.pages;
      } else {
        textContent = buffer.toString("utf-8");
        // Se o arquivo texto for muito pequeno (menos de 50 caracteres), ignora
        if (textContent.trim().length < 50) continue;
      }

      console.log("\n========================================");
      console.log(`📄 Ingerindo [${category.toUpperCase()}]: ${filename}`);

      await ingestDocument({
        title,
        filename: relative.replace(/\\/g, "/"), // Manter relativo normalizado
        category,
        text: textContent,
        checksum,
        metadata: {
          pages: pageCount,
          sourcePath: relative,
          fileType: ext
        }
      });

      console.log("✅ Documento processado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao processar o arquivo:", file, error.message);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion()
    .then(() => {
      console.log("\n✨ Processo de ingestão finalizado.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Erro fatal na ingestão:", err);
      process.exit(1);
    });
}