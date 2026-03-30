-- ============================================================
-- 010: 3rd-semester analysts get full admin-level access
-- Updates get_my_role() so all existing RLS policies that check
-- get_my_role() = 'admin' automatically pass for these users.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT
    CASE
      WHEN semester = '3rd' THEN 'admin'
      ELSE role
    END
  FROM public.profiles
  WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
