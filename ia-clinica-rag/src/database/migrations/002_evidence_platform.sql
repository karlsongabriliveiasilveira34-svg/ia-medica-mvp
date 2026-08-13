-- Phase 2: Evidence-Based Clinical Platform Additive Migration Schema

-- 1. Sources Table (Structured Document & Medical Literature Catalog)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id VARCHAR(100) UNIQUE,
  title TEXT NOT NULL,
  authors JSONB DEFAULT '[]'::jsonb,
  organization VARCHAR(255),
  journal VARCHAR(255),
  source_type VARCHAR(100) NOT NULL DEFAULT 'GUIDELINE', -- 'GUIDELINE', 'SYSTEMATIC_REVIEW', 'RCT', 'BOOK', 'PROTOCOL'
  document_type VARCHAR(100) DEFAULT 'PDF',
  doi VARCHAR(255),
  pmid VARCHAR(100),
  isbn VARCHAR(100),
  url TEXT,
  pdf_path TEXT,
  language VARCHAR(10) DEFAULT 'pt',
  specialties JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  version VARCHAR(50) DEFAULT '1.0',
  effective_date DATE,
  expiration_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUPERSEDED', 'ARCHIVED', 'DRAFT'
  supersedes_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Additive columns for documents table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='source_id') THEN
    ALTER TABLE documents ADD COLUMN source_id UUID REFERENCES sources(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='effective_date') THEN
    ALTER TABLE documents ADD COLUMN effective_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='expiration_date') THEN
    ALTER TABLE documents ADD COLUMN expiration_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='status') THEN
    ALTER TABLE documents ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
  END IF;
END $$;

-- 3. Additive columns for document_chunks table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='page_number') THEN
    ALTER TABLE document_chunks ADD COLUMN page_number INT DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='section_title') THEN
    ALTER TABLE document_chunks ADD COLUMN section_title VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='subsection_title') THEN
    ALTER TABLE document_chunks ADD COLUMN subsection_title VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='start_offset') THEN
    ALTER TABLE document_chunks ADD COLUMN start_offset INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='end_offset') THEN
    ALTER TABLE document_chunks ADD COLUMN end_offset INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='document_chunks' AND column_name='evidence_type') THEN
    ALTER TABLE document_chunks ADD COLUMN evidence_type VARCHAR(100) DEFAULT 'GENERAL';
  END IF;
END $$;

-- 4. Clinical Agents Registry Table
CREATE TABLE IF NOT EXISTS clinical_agents (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  retrieval_filters JSONB DEFAULT '{}'::jsonb,
  preferred_sources JSONB DEFAULT '[]'::jsonb,
  clinical_domains JSONB DEFAULT '[]'::jsonb,
  safety_rules JSONB DEFAULT '[]'::jsonb,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clinical Sessions (Case Memory)
CREATE TABLE IF NOT EXISTS clinical_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(100) REFERENCES clinical_agents(id) ON DELETE SET NULL,
  clinical_context JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Clinical Decisions (Audit Log of Generated Recommendations)
CREATE TABLE IF NOT EXISTS clinical_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES clinical_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  analyzed_intent JSONB DEFAULT '{}'::jsonb,
  agent_id VARCHAR(100),
  response_text TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  evidence_level VARCHAR(50),
  is_verified BOOLEAN DEFAULT TRUE,
  citations JSONB DEFAULT '[]'::jsonb,
  differential_diagnoses JSONB DEFAULT '[]'::jsonb,
  red_flags JSONB DEFAULT '[]'::jsonb,
  model_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  session_id UUID,
  decision_id UUID,
  agent_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  user_action VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Physician Feedback Loop
CREATE TABLE IF NOT EXISTS physician_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES clinical_decisions(id) ON DELETE CASCADE,
  rating VARCHAR(50) NOT NULL, -- 'CORRECT', 'INCORRECT', 'INSUFFICIENT_EVIDENCE', 'INADEQUATE_SOURCE'
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_sources_status ON sources(status);
CREATE INDEX IF NOT EXISTS idx_sources_source_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_document_chunks_page ON document_chunks(page_number);
CREATE INDEX IF NOT EXISTS idx_clinical_decisions_session ON clinical_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type);
