-- 014: Add deliberation status to applicants
-- Extends the status flow: pending → interview → deliberation → accepted / rejected
-- Run after 013_populate_fall2026_applicants.sql

-- Drop the existing status CHECK constraint and re-add it with 'deliberation'
ALTER TABLE applicants
  DROP CONSTRAINT IF EXISTS applicants_status_check;

ALTER TABLE applicants
  ADD CONSTRAINT applicants_status_check
    CHECK (status IN ('pending', 'interview', 'deliberation', 'accepted', 'rejected'));

-- Add a timestamp so admins can see when deliberation was opened for a candidate
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS deliberation_started_at TIMESTAMPTZ;
