-- ============================================================================
-- Fix Ambiguous Column Reference in Storage Policies
-- Date: 2025-10-19
-- Purpose: Fix "column reference 'file_path' is ambiguous" error in storage policies
-- Issue: Both storage.objects and public.sources have file_path column
-- ============================================================================

-- Drop the problematic policies
drop policy if exists "allow_authenticated_read_if_source_accessible" on storage.objects;
drop policy if exists "allow_users_update_own_files" on storage.objects;
drop policy if exists "allow_operators_or_owners_to_delete" on storage.objects;

-- ============================================================================
-- RECREATE POLICIES WITH FULLY QUALIFIED COLUMN REFERENCES
-- ============================================================================

-- Policy 1: Allow reading files if user can access the source
-- Fix: Only check pdf_file_path which is unambiguous
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
-- Fix: Use table alias to avoid ambiguity
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
-- Fix: Use table alias and only check pdf_file_path
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

-- Note: Cannot add comments on storage.objects policies due to permissions
-- Policies have been recreated with table aliases to avoid ambiguous column references
