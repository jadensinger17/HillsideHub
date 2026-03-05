-- ============================================================
-- 002: applicants table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.applicants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  email               TEXT UNIQUE,
  gpa                 NUMERIC(3, 2) NOT NULL CHECK (gpa >= 0.0 AND gpa <= 4.0),
  application_message TEXT,
  resume_path         TEXT,  -- Supabase Storage: resumes/{id}/{filename}
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'interview', 'accepted', 'rejected')),
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applicants_status ON public.applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_gpa    ON public.applicants(gpa DESC);

-- Enable RLS
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Only admins can read applicants
CREATE POLICY "Admins read applicants"
  ON public.applicants FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Only admins can insert applicants
CREATE POLICY "Admins insert applicants"
  ON public.applicants FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Only admins can update applicants (status changes, resume upload, etc.)
CREATE POLICY "Admins update applicants"
  ON public.applicants FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Only admins can delete applicants
CREATE POLICY "Admins delete applicants"
  ON public.applicants FOR DELETE
  USING (public.get_my_role() = 'admin');
