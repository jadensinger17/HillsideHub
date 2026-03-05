-- ============================================================
-- 003: interview_rubrics table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.interview_rubrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id  UUID NOT NULL REFERENCES public.applicants(id) ON DELETE CASCADE,
  template      JSONB NOT NULL DEFAULT '{}',   -- rubric structure (provided later)
  responses     JSONB NOT NULL DEFAULT '{}',   -- filled-in answers
  filled_by     UUID REFERENCES public.profiles(id),
  is_complete   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(applicant_id)  -- one rubric per applicant
);

-- Enable RLS
ALTER TABLE public.interview_rubrics ENABLE ROW LEVEL SECURITY;

-- Only admins can read rubrics
CREATE POLICY "Admins read rubrics"
  ON public.interview_rubrics FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Only admins can create rubrics (auto-created when applicant moves to interview)
CREATE POLICY "Admins insert rubrics"
  ON public.interview_rubrics FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Only admins can fill out / update rubrics
CREATE POLICY "Admins update rubrics"
  ON public.interview_rubrics FOR UPDATE
  USING (public.get_my_role() = 'admin');
