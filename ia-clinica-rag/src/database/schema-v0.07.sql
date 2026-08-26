-- ====================================================================
-- SCHEMA OFICIAL MedIa v0.07 — SECURITY, AUDIT, COUPONS & FEEDBACK
-- ====================================================================

-- 1. Extensões Obrigatórias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Tabela de Usuários (Google Auth, Perfis & Modos)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  photo_url TEXT,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'estudante', 'clinica', 'medico')),
  crm VARCHAR(50),
  specialty VARCHAR(100),
  verified_medical VARCHAR(50) DEFAULT 'pending',
  app_mode VARCHAR(50) DEFAULT 'medico' CHECK (app_mode IN ('medico', 'estudante', 'paciente')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Tabela de Feedbacks & Relatos de Bugs (medIa v0.07)
CREATE TABLE IF NOT EXISTS feedbacks_and_bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  type VARCHAR(50) DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'medical', 'compliment')),
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  tab_context VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'wontfix')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Resgate de Cupons Promocionais (medIa v0.07)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  coupon_code VARCHAR(50) NOT NULL,
  plan_granted VARCHAR(50) DEFAULT 'medico',
  days_granted INT DEFAULT 7,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_coupon_per_user UNIQUE(user_id, coupon_code)
);

-- 5. Tabela de Logs de Auditoria e Segurança (XSS, Rate Limit, Injeção)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- 'RATE_LIMIT_EXCEEDED', 'DANGEROUS_CHARACTERS', 'XSS_ATTEMPT', 'LENGTH_EXCEEDED'
  blocked_reason TEXT,
  payload_preview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Revisão Espaçada de Flashcards (SM-2 Algorithm)
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id VARCHAR(100) NOT NULL,
  card_id INT NOT NULL,
  repetitions INT DEFAULT 0,
  interval_days INT DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  last_rating VARCHAR(20), -- 'again', 'hard', 'good', 'easy'
  next_review_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, deck_id, card_id)
);

-- 7. Índices de Performance e Busca Rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks_and_bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_user ON coupon_redemptions(user_id, coupon_code);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_audit_logs(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcards_review ON flashcard_progress(user_id, next_review_at);
