-- Migration: Fix Storage Policies for Sources Bucket
-- Date: 2025-10-20
-- Purpose: Add RLS policies to allow authenticated users to upload/manage files in sources bucket
-- Issue: storage.objects has RLS enabled but no policies, preventing all uploads

-- Policy 1: Allow authenticated users to INSERT files into sources bucket
create policy "authenticated_users_can_upload_to_sources"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'sources'
);

-- Policy 2: Allow authenticated users to SELECT files in sources bucket
create policy "authenticated_users_can_read_files_in_sources"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'sources'
);

-- Policy 3: Allow authenticated users to UPDATE files in sources bucket
create policy "authenticated_users_can_update_files_in_sources"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'sources'
)
with check (
  bucket_id = 'sources'
);

-- Policy 4: Allow authenticated users to DELETE files in sources bucket
create policy "authenticated_users_can_delete_files_in_sources"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'sources'
);
