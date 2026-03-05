-- Add columns matching the HV Genesis Fund application CSV
ALTER TABLE applicants
  ADD COLUMN IF NOT EXISTS major               TEXT,
  ADD COLUMN IF NOT EXISTS expected_graduation TEXT,
  ADD COLUMN IF NOT EXISTS why_hillside        TEXT,
  ADD COLUMN IF NOT EXISTS contribution        TEXT,
  ADD COLUMN IF NOT EXISTS vertical_interest   TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url        TEXT;
