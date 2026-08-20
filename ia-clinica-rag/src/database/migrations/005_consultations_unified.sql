-- Phase 5: Unified Consultation Entity, Medical Report & Ambient AI Scribe
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES clinical_sessions(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) DEFAULT 'Paciente em Atendimento',
  patient_age INT DEFAULT 0,
  patient_gender VARCHAR(50) DEFAULT 'Não informado',
  record_number VARCHAR(100),
  audio_transcript TEXT,
  clinical_reasoning JSONB DEFAULT '{}'::jsonb,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  audit_trace_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultations_session ON consultations(session_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at DESC);
