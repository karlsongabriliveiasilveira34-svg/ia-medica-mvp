-- Phase 6: Official Medical Knowledge Base Expansion & Governance (MS/CONITEC, WHO, PAHO, MSF, Cochrane, PubMed, SciELO)

-- 1. Additive columns for sources table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='authority_level') THEN
    ALTER TABLE sources ADD COLUMN authority_level INT NOT NULL DEFAULT 4;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='evidence_level') THEN
    ALTER TABLE sources ADD COLUMN evidence_level VARCHAR(50) DEFAULT 'high';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='validation_status') THEN
    ALTER TABLE sources ADD COLUMN validation_status VARCHAR(50) NOT NULL DEFAULT 'approved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='medical_area') THEN
    ALTER TABLE sources ADD COLUMN medical_area VARCHAR(100) DEFAULT 'Clínica Geral';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='condition') THEN
    ALTER TABLE sources ADD COLUMN condition VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='license') THEN
    ALTER TABLE sources ADD COLUMN license VARCHAR(100) DEFAULT 'Domínio Público / Acesso Aberto Oficial';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='canonical_url') THEN
    ALTER TABLE sources ADD COLUMN canonical_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='content_hash') THEN
    ALTER TABLE sources ADD COLUMN content_hash VARCHAR(64);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sources' AND column_name='retrieved_at') THEN
    ALTER TABLE sources ADD COLUMN retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- 2. Indexes for fast filtering and deduplication
CREATE INDEX IF NOT EXISTS idx_sources_authority ON sources(authority_level);
CREATE INDEX IF NOT EXISTS idx_sources_validation ON sources(validation_status);
CREATE INDEX IF NOT EXISTS idx_sources_medical_area ON sources(medical_area);
CREATE INDEX IF NOT EXISTS idx_sources_condition ON sources(condition);
CREATE INDEX IF NOT EXISTS idx_sources_content_hash ON sources(content_hash);
