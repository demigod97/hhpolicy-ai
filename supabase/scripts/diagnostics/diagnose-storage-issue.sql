-- ============================================================================
-- Diagnostic Script for Storage Access Issues
-- Run this to understand why PDFs are not loading
-- ============================================================================

-- 1. Check if storage buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('sources', 'policy-documents');

-- 2. Check if storage policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 3. Check if our helper function exists
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'can_access_pdf_storage';

-- 4. Check sample sources data
SELECT
  id,
  title,
  target_role,
  pdf_storage_bucket,
  pdf_file_path,
  uploaded_by_user_id
FROM sources
WHERE type = 'pdf'
  AND processing_status = 'completed'
LIMIT 5;

-- 5. Test the can_access_pdf_storage function directly
-- This will help us see if the function works
SELECT public.can_access_pdf_storage(
  'sources',
  (SELECT pdf_file_path FROM sources WHERE pdf_file_path IS NOT NULL LIMIT 1),
  (SELECT uploaded_by_user_id FROM sources WHERE uploaded_by_user_id IS NOT NULL LIMIT 1)
) AS can_access;

-- 6. Check RLS is enabled on storage.objects
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';
