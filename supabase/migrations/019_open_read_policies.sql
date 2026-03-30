-- ============================================================
-- 019: Open read access to all authenticated users
--
-- Recruitment and pipeline pages are now accessible to all members.
-- Replace admin-only SELECT policies with authenticated-user policies.
-- Write operations (INSERT/UPDATE/DELETE) remain admin-only.
-- ============================================================

-- ------------------------------------------------------------
-- applicants: all authenticated users can read
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins read applicants" ON public.applicants;

CREATE POLICY "Authenticated users read applicants"
  ON public.applicants FOR SELECT
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- interview_rubrics: all authenticated users can read and fill
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins read rubrics" ON public.interview_rubrics;
DROP POLICY IF EXISTS "Admins update rubrics" ON public.interview_rubrics;

CREATE POLICY "Authenticated users read rubrics"
  ON public.interview_rubrics FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can fill out a rubric (e.g. interviewers)
CREATE POLICY "Authenticated users update rubrics"
  ON public.interview_rubrics FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- deals: all authenticated users can read
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Full access users read deals" ON public.deals;

CREATE POLICY "Authenticated users read deals"
  ON public.deals FOR SELECT
  USING (auth.role() = 'authenticated');
