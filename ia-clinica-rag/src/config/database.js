import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

const isLocalHost = env.databaseUrl.includes("localhost") || env.databaseUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isLocalHost ? false : { rejectUnauthorized: false }
});

pool.on("error", (error) => {
  console.error("Erro inesperado no PostgreSQL:", error);
});

export async function query(text, params) {
  return pool.query(text, params);
}