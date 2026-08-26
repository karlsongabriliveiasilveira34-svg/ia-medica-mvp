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

let schemaSyncPromise = null;

export async function ensureUsersSchema() {
  if (schemaSyncPromise) return schemaSyncPromise;

  schemaSyncPromise = (async () => {
    try {
      const ddl = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          google_id VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          photo_url TEXT,
          password_hash TEXT,
          plan VARCHAR(50) DEFAULT 'estudante',
          crm VARCHAR(50),
          specialty VARCHAR(100),
          verified_medical VARCHAR(50) DEFAULT 'pending',
          app_mode VARCHAR(50) DEFAULT 'estudante',
          email_verificado BOOLEAN DEFAULT false,
          token_verificacao TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          last_ip VARCHAR(100),
          last_user_agent TEXT,
          is_active BOOLEAN DEFAULT TRUE
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS token_verificacao TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'estudante';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS app_mode VARCHAR(50) DEFAULT 'estudante';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS crm VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_user_agent TEXT;
        ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;
      `;
      await pool.query(ddl);
      console.log("[DATABASE] ✅ Schema de usuários sincronizado com sucesso.");
    } catch (err) {
      console.warn("[DATABASE] ⚠️ Aviso de sincronização no PostgreSQL (modo resiliente):", err.message);
    }
  })();

  return schemaSyncPromise;
}