import pg from "pg";
import { env } from "./env.js";
import { INITIAL_QUESTIONS, INITIAL_FLASHCARDS } from "../../frontend/src/data/medicalQuestionsAndCards.js";

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

        -- 1. TABELA DE USUÁRIOS (COM PLANO FREE OBRIGATÓRIO COMO PADRÃO)
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          google_id VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          photo_url TEXT,
          password_hash TEXT,
          plan VARCHAR(50) DEFAULT 'free',
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
        ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS app_mode VARCHAR(50) DEFAULT 'estudante';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS crm VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_user_agent TEXT;
        ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

        -- 2. TABELA DE SESSÕES
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 3. TABELA OFICIAL DE QUESTÕES MÉDICAS (ENARE / REVALIDA / USP)
        CREATE TABLE IF NOT EXISTS questoes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          banca VARCHAR(100) DEFAULT 'ENARE',
          especialidade VARCHAR(100) NOT NULL,
          tema VARCHAR(150) NOT NULL,
          dificuldade VARCHAR(20) DEFAULT 'media',
          enunciado TEXT NOT NULL,
          alternativas JSONB NOT NULL,
          resposta_correta INT NOT NULL,
          explicacao TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 4. TABELA DE PROGRESSO E RESPOSTAS DOS ESTUDANTES
        CREATE TABLE IF NOT EXISTS questoes_respostas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          questao_id VARCHAR(255) NOT NULL,
          especialidade VARCHAR(100),
          alternativa_selecionada INT NOT NULL,
          acertou BOOLEAN NOT NULL,
          tempo_segundos INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 5. TABELA DE FLASHCARDS
        CREATE TABLE IF NOT EXISTS flashcards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          deck_id VARCHAR(50) NOT NULL,
          frente TEXT NOT NULL,
          verso TEXT NOT NULL,
          dica TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 6. TABELA DE DOAÇÕES E PAGAMENTOS PIX
        CREATE TABLE IF NOT EXISTS doacoes_pix (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          txid VARCHAR(100) UNIQUE NOT NULL,
          user_id VARCHAR(255),
          user_email VARCHAR(255),
          valor DECIMAL(10,2) NOT NULL,
          plano_alvo VARCHAR(50),
          status VARCHAR(50) DEFAULT 'pendente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          confirmed_at TIMESTAMP
        );
      `;
      await pool.query(ddl);

      // Seed inicial de questões se a tabela estiver vazia
      try {
        const countRes = await pool.query("SELECT COUNT(*) FROM questoes");
        const total = parseInt(countRes.rows[0].count, 10);
        if (total === 0 && Array.isArray(INITIAL_QUESTIONS) && INITIAL_QUESTIONS.length > 0) {
          console.log(`[DATABASE] 📥 Inserindo acervo inicial de ${INITIAL_QUESTIONS.length} questões oficiais no PostgreSQL...`);
          for (const q of INITIAL_QUESTIONS) {
            await pool.query(
              `INSERT INTO questoes (banca, especialidade, tema, dificuldade, enunciado, alternativas, resposta_correta, explicacao)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                q.exam || 'ENARE',
                q.area || 'Clínica Médica',
                q.topic || 'Geral',
                'media',
                q.question,
                JSON.stringify(q.options),
                q.correct !== undefined ? q.correct : 0,
                q.explanation || 'Resolução comentada baseada em diretrizes oficiais.'
              ]
            );
          }
          console.log("[DATABASE] ✅ Acervo de questões indexado com sucesso no PostgreSQL.");
        }
      } catch (seedErr) {
        console.warn("[DATABASE] ⚠️ Aviso no seed de questões:", seedErr.message);
      }

      console.log("[DATABASE] ✅ Schema completo e tabelas de estudo sincronizadas com sucesso.");
    } catch (err) {
      console.warn("[DATABASE] ⚠️ Aviso de sincronização no PostgreSQL (modo resiliente):", err.message);
    }
  })();

  return schemaSyncPromise;
}