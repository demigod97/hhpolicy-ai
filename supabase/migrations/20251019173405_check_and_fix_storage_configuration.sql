-- ============================================================================
-- Check and Fix Storage Configuration
-- Date: 2025-10-19
-- Purpose: Ensure storage buckets exist and verify storage policies
-- ============================================================================

-- Ensure 'sources' bucket exists with proper configuration
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sources',
  'sources',
  false, -- private bucket
  52428800, -- 50MB limit
  array['application/pdf', 'image/png', 'image/jpeg', 'text/plain']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];

-- Ensure 'policy-documents' bucket exists with proper configuration
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'policy-documents',
  'policy-documents',
  false, -- private bucket
  52428800, -- 50MB limit
  array['application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = array['application/pdf'];

-- Add helpful comments
comment on table storage.buckets is 'Storage buckets configuration for file uploads';
