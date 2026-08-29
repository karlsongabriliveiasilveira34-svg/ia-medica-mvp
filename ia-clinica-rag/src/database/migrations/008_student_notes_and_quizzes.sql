-- ====================================================================
-- MIGRATION 008: STUDENT NOTES, STYLUS CANVAS, QUIZ HISTORY & IA PRECEPTORA
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Anotacoes do Estudante (Texto, Voz, Stylus Canvas & IA)
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  title VARCHAR(255) NOT NULL DEFAULT 'Nova Anotacao',
  content TEXT NOT NULL DEFAULT '',
  drawing_data TEXT,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Historico e Relatorios de Simulados (50 Questoes)
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  score INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 50,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indices para buscas rapidas e ordenacao por data
CREATE INDEX IF NOT EXISTS idx_student_notes_user_id ON student_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_created_at ON student_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_created_at ON quiz_history(created_at DESC);
