-- ============================================================
-- 004: mid_semester_reports table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mid_semester_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyst_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  form_data    JSONB NOT NULL DEFAULT '{}',   -- analyst's form answers (fields TBD)
  submitted_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(analyst_id)  -- one report per analyst (extend with semester_id later)
);

CREATE INDEX IF NOT EXISTS idx_mid_semester_analyst
  ON public.mid_semester_reports(analyst_id);

-- Enable RLS
ALTER TABLE public.mid_semester_reports ENABLE ROW LEVEL SECURITY;

-- Analysts can read their own report
CREATE POLICY "Analysts read own report"
  ON public.mid_semester_reports FOR SELECT
  USING (analyst_id = auth.uid());

-- Admins can read all reports
CREATE POLICY "Admins read all reports"
  ON public.mid_semester_reports FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Analysts can insert their own report
CREATE POLICY "Analysts insert own report"
  ON public.mid_semester_reports FOR INSERT
  WITH CHECK (analyst_id = auth.uid() AND public.get_my_role() = 'analyst');

-- Analysts can update their own report
CREATE POLICY "Analysts update own report"
  ON public.mid_semester_reports FOR UPDATE
  USING (analyst_id = auth.uid() AND public.get_my_role() = 'analyst');
