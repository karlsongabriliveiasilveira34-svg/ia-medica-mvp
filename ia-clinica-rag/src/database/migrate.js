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

    const migrationV3Path = path.join(__dirname, "migrations", "003_conversation_memory.sql");
    console.log("⚡ Executando migração 003_conversation_memory.sql...");
    const sqlV3 = await fs.readFile(migrationV3Path, "utf-8");
    await pool.query(sqlV3);

    const migrationV4Path = path.join(__dirname, "migrations", "004_physician_decision_tracking.sql");
    console.log("⚡ Executando migração 004_physician_decision_tracking.sql...");
    const sqlV4 = await fs.readFile(migrationV4Path, "utf-8");
    await pool.query(sqlV4);

    const migrationV5Path = path.join(__dirname, "migrations", "005_consultations_unified.sql");
    console.log("⚡ Executando migração 005_consultations_unified.sql...");
    const sqlV5 = await fs.readFile(migrationV5Path, "utf-8");
    await pool.query(sqlV5);

    const migrationV6Path = path.join(__dirname, "migrations", "006_official_knowledge_base.sql");
    console.log("⚡ Executando migração 006_official_knowledge_base.sql...");
    const sqlV6 = await fs.readFile(migrationV6Path, "utf-8");
    await pool.query(sqlV6);

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
