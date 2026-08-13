import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigration() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const migrationV2Path = path.join(__dirname, "migrations", "002_evidence_platform.sql");

  try {
    console.log("📄 Lendo esquema SQL base em:", schemaPath);
    const sqlBase = await fs.readFile(schemaPath, "utf-8");
    await pool.query(sqlBase);

    console.log("⚡ Executando migração 002_evidence_platform.sql...");
    const sqlV2 = await fs.readFile(migrationV2Path, "utf-8");
    await pool.query(sqlV2);

    console.log("✅ Migração do banco de dados concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a migração do banco de dados:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}
