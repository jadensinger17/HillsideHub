-- ============================================================
-- 007: add onboarding fields to profiles
-- semester: completion sentinel — NULL means onboarding not done
-- fund_role: the user's team within Hillside (distinct from admin/analyst role)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS semester TEXT CHECK (semester IN ('1st', '2nd', '3rd')),
  ADD COLUMN IF NOT EXISTS fund_role TEXT CHECK (fund_role IN (
    'recruitment_team',
    'portfolio_team',
    'modeling_team',
    'relations_team',
    'operations_team',
    'chief_of_staff'
  ));

-- No NOT NULL / DEFAULT — NULL semester is the onboarding completion gate.
-- Existing users will have NULL and will be prompted to complete onboarding on next login.
-- The existing RLS policy "Users update own profile" already permits updating these columns
-- (its WITH CHECK only blocks changes to the role column, not semester or fund_role).
