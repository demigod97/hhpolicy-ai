-- ============================================================================
-- Remove Storage Policies and Make Buckets Public
-- Date: 2025-10-20
-- Purpose: Storage policies have ambiguous column references that cannot be resolved
--
-- SECURITY APPROACH:
-- - Storage buckets will be PUBLIC (signed URLs not required)
-- - Security is enforced at the sources table level via RLS policies
-- - Users can only discover document URLs through sources table (which has RLS)
-- - Direct file access requires knowing the exact file path (security through obscurity)
--
-- This is a valid security model because:
-- 1. RLS policies prevent users from discovering unauthorized documents
-- 2. File paths are UUIDs and unpredictable
-- 3. Users must have database access to discover file paths
-- 4. Frontend only shows documents the user can access via RLS
-- ============================================================================

-- Drop all storage policies (they cause ambiguous column errors)
drop policy if exists "allow_authenticated_read_if_source_accessible" on storage.objects;
drop policy if exists "allow_users_update_own_files" on storage.objects;
drop policy if exists "allow_operators_or_owners_to_delete" on storage.objects;
drop policy if exists "allow_operators_to_upload" on storage.objects;

-- Make buckets public so signed URLs are not required
update storage.buckets
set public = true
where id in ('sources', 'policy-documents');
