-- ====================================================================
-- SCHEMA OFICIAL MedIa v0.05 — POSTGRESQL WEB DATABASE & ACCESS CONTROL
-- ====================================================================

-- 1. Extensões Obrigatórias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Tabela de Usuários (Google Auth & Planos)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  photo_url TEXT,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'estudante', 'clinica', 'medico')),
  crm VARCHAR(50),
  specialty VARCHAR(100),
  verified_medical VARCHAR(50) DEFAULT 'pending', -- 'null', 'pending', 'verified'
  app_mode VARCHAR(50) DEFAULT 'medico' CHECK (app_mode IN ('medico', 'estudante', 'paciente')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT valid_plan CHECK (plan IN ('free', 'estudante', 'clinica', 'medico'))
);

-- 3. Tabela de Medição de Uso (Requisições, Tokens, Caracteres, Uploads)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- Primeiro dia do mês corrente (ex: 2026-08-01)
  plan VARCHAR(50) NOT NULL,
  requests_used INT DEFAULT 0,
  requests_limit INT NOT NULL,
  tokens_used INT DEFAULT 0,
  tokens_limit INT NOT NULL,
  characters_used INT DEFAULT 0,
  files_uploaded INT DEFAULT 0,
  files_limit INT NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month),
  CONSTRAINT positive_numbers CHECK (requests_used >= 0 AND tokens_used >= 0 AND characters_used >= 0)
);

-- 4. Tabela de Conversas e Histórico Clínico
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN DEFAULT FALSE,
  last_message_preview TEXT,
  message_count INT DEFAULT 0,
  plan_at_creation VARCHAR(50)
);

-- 5. Tabela de Mensagens da Conversa
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  character_count INT,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP,
  is_edited BOOLEAN DEFAULT FALSE,
  files_attached INT DEFAULT 0
);

-- 6. Tabela de Documentos Anexados / Uploads RAG
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt, jpg, png, dicom
  file_size INT NOT NULL, -- tamanho em bytes
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP,
  is_processed BOOLEAN DEFAULT FALSE,
  character_count INT,
  pages_count INT,
  error_on_processing TEXT,
  CONSTRAINT valid_size CHECK (file_size > 0)
);

-- 7. Tabela de Contribuições & Pagamentos PIX (Chave 38 98404056 35)
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  pix_key VARCHAR(255) DEFAULT '38984040563',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'failed')),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  received_at TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- 8. Tabela de Sessões JWT
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  access_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);

-- 9. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 10. Trigger de Atualização Automática de Timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_conversations_timestamp ON conversations;
CREATE TRIGGER update_conversations_timestamp BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
