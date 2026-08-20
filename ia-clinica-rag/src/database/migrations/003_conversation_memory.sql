-- Phase 3: Conversation Memory & Real Citation Metadata Schema Migration

-- 1. Conversation Messages Table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES clinical_sessions(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL, -- 'user' or 'bot'
  text TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Additive columns for documents table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='authors') THEN
    ALTER TABLE documents ADD COLUMN authors JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='publication_year') THEN
    ALTER TABLE documents ADD COLUMN publication_year INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='organization') THEN
    ALTER TABLE documents ADD COLUMN organization VARCHAR(255);
  END IF;
END $$;

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created ON conversation_messages(created_at ASC);
