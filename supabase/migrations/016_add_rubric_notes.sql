-- 016: Add per-question notes column to interview_rubrics
-- Stores interviewer text observations keyed by rubric field key (e.g. "b1", "t2")
-- Separate from responses (numeric ratings) for clean querying

ALTER TABLE interview_rubrics
  ADD COLUMN IF NOT EXISTS notes JSONB NOT NULL DEFAULT '{}';
