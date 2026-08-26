import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

function getPoolConfig(rawUrl) {
  const isLocalHost = (rawUrl || "").includes("localhost") || (rawUrl || "").includes("127.0.0.1");
  const ssl = isLocalHost ? false : { rejectUnauthorized: false };

  try {
    // Usar a API padrão WHATWG new URL(...) para evitar url.parse() DeprecationWarning
    const parsed = new URL(rawUrl);
    return {
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : "postgres",
      ssl
    };
  } catch (err) {
    return {
      connectionString: rawUrl,
      ssl
    };
  }
}

export const pool = new Pool(getPoolConfig(env.databaseUrl));

pool.on("error", (error) => {
  console.error("Erro inesperado no PostgreSQL:", error.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}