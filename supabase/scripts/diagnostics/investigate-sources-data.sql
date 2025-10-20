-- Investigation Script for Sources Table
-- Run this to understand the current state of documents

-- Check all documents and their metadata
SELECT
  id,
  title,
  target_role,
  uploaded_by_user_id,
  pdf_file_path,
  pdf_storage_bucket,
  file_path,
  processing_status,
  created_at
FROM sources
WHERE type = 'pdf'
ORDER BY created_at DESC;

-- Count documents by target_role
SELECT
  target_role,
  COUNT(*) as count
FROM sources
WHERE type = 'pdf'
GROUP BY target_role
ORDER BY count DESC;

-- Find documents with NULL target_role
SELECT
  id,
  title,
  target_role,
  pdf_storage_bucket
FROM sources
WHERE type = 'pdf' AND target_role IS NULL;

-- Find documents with NULL pdf_storage_bucket
SELECT
  id,
  title,
  pdf_file_path,
  pdf_storage_bucket
FROM sources
WHERE type = 'pdf' AND pdf_file_path IS NOT NULL AND pdf_storage_bucket IS NULL;

-- Check storage policies on storage.objects table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
