-- ============================================================================
-- Simplify Storage Policies
-- Date: 2025-10-19
-- Purpose: Replace complex storage policies with simpler ones that rely on sources table RLS
-- ============================================================================

-- Drop all existing storage policies
drop policy if exists "role_based_read_access" on storage.objects;
drop policy if exists "authorized_users_can_upload" on storage.objects;
drop policy if exists "users_can_update_own_files" on storage.objects;
drop policy if exists "authorized_users_can_delete" on storage.objects;
drop policy if exists "role_based_read_access_policy_docs" on storage.objects;
drop policy if exists "authorized_users_can_upload_policy_docs" on storage.objects;
drop policy if exists "users_can_update_own_policy_docs" on storage.objects;
drop policy if exists "authorized_users_can_delete_policy_docs" on storage.objects;

-- ============================================================================
-- NEW SIMPLIFIED APPROACH
-- Storage policies just check if file belongs to an accessible source
-- Access control is handled by sources table RLS (which works correctly)
-- ============================================================================

-- Policy 1: Allow reading files if user can access the source
-- If user can query the sources table and find this file, they have access
create policy "allow_authenticated_read_if_source_accessible"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources
    where (
      public.sources.pdf_file_path = storage.objects.name
      or public.sources.file_path = storage.objects.name
    )
  )
);

-- Policy 2: Allow system_owner and company_operator to upload
create policy "allow_operators_to_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('sources', 'policy-documents')
  and (
    (select get_user_role((select auth.uid()))) in ('system_owner', 'company_operator')
  )
);

-- Policy 3: Allow users to update their own uploaded files
create policy "allow_users_update_own_files"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources
    where (
      public.sources.pdf_file_path = storage.objects.name
      or public.sources.file_path = storage.objects.name
    )
    and public.sources.uploaded_by_user_id = (select auth.uid())
  )
)
with check (
  bucket_id in ('sources', 'policy-documents')
  and exists (
    select 1
    from public.sources
    where (
      public.sources.pdf_file_path = storage.objects.name
      or public.sources.file_path = storage.objects.name
    )
    and public.sources.uploaded_by_user_id = (select auth.uid())
  )
);

-- Policy 4: Allow operators or file owners to delete
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
      from public.sources
      where (
        public.sources.pdf_file_path = storage.objects.name
        or public.sources.file_path = storage.objects.name
      )
      and public.sources.uploaded_by_user_id = (select auth.uid())
    )
  )
);

-- Add helpful comments explaining the approach
comment on policy "allow_authenticated_read_if_source_accessible" on storage.objects is
'Allows authenticated users to read files if they exist in the sources table.
The sources table RLS policies handle role-based access control.
If a user can query sources and see a file path, they can access that file.';

comment on policy "allow_operators_to_upload" on storage.objects is
'Only system_owner and company_operator roles can upload new files to storage.';

comment on policy "allow_users_update_own_files" on storage.objects is
'Users can update files they uploaded themselves.';

comment on policy "allow_operators_or_owners_to_delete" on storage.objects is
'System owners and company operators can delete any file.
Regular users can only delete files they uploaded.';
