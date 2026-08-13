import fs from "fs/promises";
import path from "path";
import { ingestDocument } from "./document.service.js";

/**
 * Script de Ingestão de Repositórios de Conhecimento IA & Bases Artigos (knowledge/)
 */
export async function ingestAllKnowledgeRepositories() {
  console.log("🚀 Iniciando ingestão dos repositórios de conhecimento e bases de IA Médica (knowledge/)...");
  const knowledgeDir = path.join(process.cwd(), "knowledge");

  try {
    const categories = await fs.readdir(knowledgeDir);
    let totalIngested = 0;

    for (const cat of categories) {
      const catPath = path.join(knowledgeDir, cat);
      const stat = await fs.stat(catPath);
      if (!stat.isDirectory()) continue;

      const items = await fs.readdir(catPath);
      for (const item of items) {
        const itemPath = path.join(catPath, item);
        const itemStat = await fs.stat(itemPath);

        if (itemStat.isDirectory()) {
          const files = await fs.readdir(itemPath);
          for (const file of files) {
            if (file.endsWith(".md") || file.endsWith(".json") || file.endsWith(".txt")) {
              const filePath = path.join(itemPath, file);
              const content = await fs.readFile(filePath, "utf-8");

              if (content.trim().length > 100) {
                console.log(`📥 Ingerindo [${cat.toUpperCase()}] ${item} / ${file}...`);
                await ingestDocument({
                  title: `[${item}] ${file}`,
                  filename: `${item}_${file}`,
                  category: cat,
                  text: content.substring(0, 15000), // Limite razoável para chunking
                  metadata: {
                    sourceType: "GUIDELINE",
                    organization: `Repositório IA ${item}`
                  }
                });
                totalIngested++;
              }
            }
          }
        }
      }
    }

    console.log(`✅ Ingestão finalizada com sucesso! Total de artigos/fontes ingeridas: ${totalIngested}`);
  } catch (err) {
    console.error("❌ Erro ao ingerir repositórios de conhecimento:", err);
  }
}

if (process.argv[1].endsWith("ingest-repositories.js")) {
  ingestAllKnowledgeRepositories().then(() => process.exit(0));
}
