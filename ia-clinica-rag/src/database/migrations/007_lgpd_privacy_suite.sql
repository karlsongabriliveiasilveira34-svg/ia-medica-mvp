-- Phase 7: LGPD Privacy by Design Suite (ALE Encryption, Blind Index & Consent Audit Trail)

-- 1. Tabela de Audit Trail de Consentimento e Base Legal (LGPD Art. 7º e 8º)
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  session_id UUID REFERENCES clinical_sessions(id) ON DELETE SET NULL,
  policy_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
  granted BOOLEAN NOT NULL DEFAULT true,
  scopes JSONB NOT NULL DEFAULT '{"clinical_processing": true, "audit_trail": true, "ai_decision_support": true, "analytics": false}'::jsonb,
  ip_address VARCHAR(100),
  user_agent TEXT,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_session ON consent_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_granted ON consent_logs(granted);
CREATE INDEX IF NOT EXISTS idx_consent_logs_granted_at ON consent_logs(granted_at DESC);

-- 2. Adicionar colunas de Criptografia ALE (AES-256-GCM) e Blind Index (HMAC-SHA256) na tabela consultations
DO $$ 
BEGIN
  -- Criptografia de nome do paciente
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='patient_name_encrypted') THEN
    ALTER TABLE consultations ADD COLUMN patient_name_encrypted TEXT;
  END IF;

  -- Blind index para busca determinística segura por nome
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='patient_name_blind_index') THEN
    ALTER TABLE consultations ADD COLUMN patient_name_blind_index VARCHAR(64);
  END IF;

  -- Criptografia de número de prontuário
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='record_number_encrypted') THEN
    ALTER TABLE consultations ADD COLUMN record_number_encrypted TEXT;
  END IF;

  -- Blind index para busca determinística de prontuário
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='record_number_blind_index') THEN
    ALTER TABLE consultations ADD COLUMN record_number_blind_index VARCHAR(64);
  END IF;

  -- Criptografia de transcrição de áudio e dados do laudo clínico
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='audio_transcript_encrypted') THEN
    ALTER TABLE consultations ADD COLUMN audio_transcript_encrypted TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='report_data_encrypted') THEN
    ALTER TABLE consultations ADD COLUMN report_data_encrypted TEXT;
  END IF;

  -- Flags de anonimização e esquecimento (DSAR Purge)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='is_anonymized') THEN
    ALTER TABLE consultations ADD COLUMN is_anonymized BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultations' AND column_name='anonymized_at') THEN
    ALTER TABLE consultations ADD COLUMN anonymized_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. Índices de busca por Blind Index na tabela consultations
CREATE INDEX IF NOT EXISTS idx_consultations_patient_blind ON consultations(patient_name_blind_index);
CREATE INDEX IF NOT EXISTS idx_consultations_record_blind ON consultations(record_number_blind_index);

-- 4. Adicionar colunas de anonimização em clinical_sessions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinical_sessions' AND column_name='is_anonymized') THEN
    ALTER TABLE clinical_sessions ADD COLUMN is_anonymized BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clinical_sessions' AND column_name='anonymized_at') THEN
    ALTER TABLE clinical_sessions ADD COLUMN anonymized_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
