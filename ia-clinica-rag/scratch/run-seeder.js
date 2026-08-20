import { OfficialGuidelinesSeeder } from "../src/services/official-guidelines.seeder.js";
import { query } from "../src/config/database.js";

async function run() {
  console.log("Iniciando semeatura de todas as diretrizes oficiais...");
  const res = await OfficialGuidelinesSeeder.seedAll();
  console.log("Resultado da Ingestão:", res);
  await query("SELECT 1");
  process.exit(0);
}

run().catch(err => {
  console.error("Erro na semeatura:", err);
  process.exit(1);
});
