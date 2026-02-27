-- ============================================================================
-- Fix Storage Policy AND Ensure All Documents Use pdf_file_path
-- Date: 2025-10-20
-- Purpose: file_path column causes ambiguity - migrate all to pdf_file_path
-- ============================================================================

-- Step 1: Ensure ALL PDF documents have pdf_file_path set
-- Copy file_path to pdf_file_path for any documents that are missing it
UPDATE sources
SET pdf_file_path = file_path
WHERE type = 'pdf'
  AND pdf_file_path IS NULL
  AND file_path IS NOT NULL;

-- Step 2: Drop the problematic policies
drop policy if exists "allow_authenticated_read_if_source_accessible" on storage.objects;
drop policy if exists "allow_users_update_own_files" on storage.objects;
drop policy if exists "allow_operators_or_owners_to_delete" on storage.objects;

-- ============================================================================
-- RECREATE POLICIES - ONLY CHECK pdf_file_path
-- All documents now have pdf_file_path, so we don't need to check file_path
-- ============================================================================

-- Policy 1: Allow reading files if user can access the source
create policy "allow_authenticated_read_if_source_accessible"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources s
    where s.pdf_file_path = storage.objects.name
  )
);

-- Policy 2: Allow users to update their own uploaded files
create policy "allow_users_update_own_files"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources s
    where s.pdf_file_path = storage.objects.name
    and s.uploaded_by_user_id = (select auth.uid())
  )
)
with check (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources s
    where s.pdf_file_path = storage.objects.name
    and s.uploaded_by_user_id = (select auth.uid())
  )
);

-- Policy 3: Allow operators or file owners to delete
create policy "allow_operators_or_owners_to_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and (
    -- Operators can delete anything
    (select get_user_role((select auth.uid()))) in ('system_owner', 'company_operator')
    or
    -- Users can delete their own uploads
    exists (
      select 1
      from public.sources s
      where s.pdf_file_path = storage.objects.name
      and s.uploaded_by_user_id = (select auth.uid())
    )
  )
);

-- Verify all PDFs have pdf_file_path set
SELECT
  count(*) as total_pdfs,
  count(pdf_file_path) as with_pdf_file_path,
  count(*) - count(pdf_file_path) as missing_pdf_file_path
FROM sources
WHERE type = 'pdf';
