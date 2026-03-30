-- 017: Add interviewers field to interview_rubrics
-- Stores the two interviewer names per section (behavioral + technical)
-- Structure: { "behavioral": ["", ""], "technical": ["", ""] }

ALTER TABLE interview_rubrics
  ADD COLUMN IF NOT EXISTS interviewers JSONB NOT NULL DEFAULT '{"behavioral": ["", ""], "technical": ["", ""]}';
