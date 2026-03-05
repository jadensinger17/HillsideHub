-- Add deliberation columns to applicants table
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS info_sessions INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS decision TEXT CHECK (decision IN ('yes', 'no', 'maybe', 'no_class'));
