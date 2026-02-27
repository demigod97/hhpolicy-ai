-- ============================================================================
-- Fix Storage Policy to Check Both pdf_file_path AND file_path
-- Date: 2025-10-20
-- Purpose: Some documents use file_path instead of pdf_file_path
-- Issue: Storage policies only checked pdf_file_path, missing some documents
-- ============================================================================

-- Drop the policies that only checked pdf_file_path
drop policy if exists "allow_authenticated_read_if_source_accessible" on storage.objects;
drop policy if exists "allow_users_update_own_files" on storage.objects;
drop policy if exists "allow_operators_or_owners_to_delete" on storage.objects;

-- ============================================================================
-- RECREATE POLICIES TO CHECK BOTH FILE PATH COLUMNS
-- ============================================================================

-- Policy 1: Allow reading files if user can access the source
-- Now checks BOTH pdf_file_path and file_path (but uses OR to avoid ambiguity)
create policy "allow_authenticated_read_if_source_accessible"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and (
    -- Check if file matches pdf_file_path
    exists (
      select 1
      from public.sources s
      where s.pdf_file_path = storage.objects.name
    )
    or
    -- OR check if file matches file_path (for legacy documents)
    exists (
      select 1
      from public.sources s
      where s.file_path = storage.objects.name
    )
  )
);

-- Policy 2: Allow users to update their own uploaded files
create policy "allow_users_update_own_files"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and (
    exists (
      select 1
      from public.sources s
      where s.pdf_file_path = storage.objects.name
      and s.uploaded_by_user_id = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.sources s
      where s.file_path = storage.objects.name
      and s.uploaded_by_user_id = (select auth.uid())
    )
  )
)
with check (
  bucket_id in ('sources', 'policy-documents')
  and (
    exists (
      select 1
      from public.sources s
      where s.pdf_file_path = storage.objects.name
      and s.uploaded_by_user_id = (select auth.uid())
    )
    or
    exists (
      select 1
      from public.sources s
      where s.file_path = storage.objects.name
      and s.uploaded_by_user_id = (select auth.uid())
    )
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
    -- Users can delete their own uploads (check both path columns)
    exists (
      select 1
      from public.sources s
      where (s.pdf_file_path = storage.objects.name or s.file_path = storage.objects.name)
      and s.uploaded_by_user_id = (select auth.uid())
    )
  )
);

-- Verify the policies were created
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'allow_authenticated_read_if_source_accessible',
    'allow_users_update_own_files',
    'allow_operators_or_owners_to_delete'
  )
order by policyname;
