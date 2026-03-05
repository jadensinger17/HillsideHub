-- ============================================================
-- 005: Supabase Storage policies for the "resumes" bucket
-- Run AFTER creating the "resumes" bucket in the Supabase dashboard
-- Storage → New bucket → Name: resumes → Public: OFF
-- ============================================================

-- Only authenticated admins can read (download) resumes
CREATE POLICY "Admin read resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND public.get_my_role() = 'admin'
  );

-- Only authenticated admins can upload resumes
CREATE POLICY "Admin upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND public.get_my_role() = 'admin'
  );

-- Only authenticated admins can delete resumes
CREATE POLICY "Admin delete resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND public.get_my_role() = 'admin'
  );
