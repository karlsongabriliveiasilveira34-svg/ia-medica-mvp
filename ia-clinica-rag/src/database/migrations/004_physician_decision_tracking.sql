-- Migration 004: Physician Decision Tracking for Medicolegal Auditability

CREATE TABLE IF NOT EXISTS physician_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES clinical_sessions(id) ON DELETE CASCADE,
  chosen_conduct TEXT NOT NULL,
  supporting_sources JSONB DEFAULT '[]'::jsonb,
  rationale TEXT,
  physician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_physician_decisions_session ON physician_decisions(session_id);
