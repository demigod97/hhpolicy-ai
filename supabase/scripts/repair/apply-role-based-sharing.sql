-- ============================================================================
-- Apply Role-Based PDF Sharing Migrations Directly
-- Date: 2025-10-20
-- ============================================================================

-- This script combines both migrations into one for direct application

\echo 'Starting role-based PDF sharing migration...'

BEGIN;

-- ============================================================================
-- PART 1: RLS Policies for sources table
-- ============================================================================

\echo 'Dropping existing sources policies...'

-- Drop existing sources policies
DROP POLICY IF EXISTS "system_owners_full_access_sources" ON sources;
DROP POLICY IF EXISTS "company_operators_full_access_sources" ON sources;
DROP POLICY IF EXISTS "board_members_read_sources" ON sources;
DROP POLICY IF EXISTS "administrators_manage_sources" ON sources;
DROP POLICY IF EXISTS "executives_view_sources" ON sources;
DROP POLICY IF EXISTS "administrators_manage_own_sources" ON sources;
DROP POLICY IF EXISTS "administrators_view_admin_sources" ON sources;
DROP POLICY IF EXISTS "executives_manage_own_sources" ON sources;
DROP POLICY IF EXISTS "executives_view_shared_sources" ON sources;

\echo 'Creating can_access_source function...'

-- Create improved can_access_source function
CREATE OR REPLACE FUNCTION can_access_source(
  source_target_role TEXT,
  source_uploader_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the current user's role
  user_role := get_user_role((SELECT auth.uid()));

  -- 1. System Owner and Company Operator can access all documents
  IF user_role IN ('system_owner', 'company_operator') THEN
    RETURN TRUE;
  END IF;

  -- 2. Board members can access all documents (read-only)
  IF user_role = 'board' THEN
    RETURN TRUE;
  END IF;

  -- 3. Users can always access their own uploads
  IF source_uploader_id = (SELECT auth.uid()) THEN
    RETURN TRUE;
  END IF;

  -- 4. Administrators can only access documents where target_role is 'administrator'
  IF user_role = 'administrator' AND source_target_role = 'administrator' THEN
    RETURN TRUE;
  END IF;

  -- 5. Executives can access documents where target_role is 'executive' or 'administrator'
  IF user_role = 'executive' AND source_target_role IN ('executive', 'administrator') THEN
    RETURN TRUE;
  END IF;

  -- 6. Unassigned documents (NULL target_role) are accessible to all authenticated users
  IF source_target_role IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Default: deny access
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

\echo 'Creating indexes...'

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sources_uploaded_by_user_id
  ON sources(uploaded_by_user_id)
  WHERE uploaded_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sources_target_role
  ON sources(target_role)
  WHERE target_role IS NOT NULL;

\echo 'Creating new RLS policies for sources...'

-- Policy 1: System Owners - Full access to all sources
CREATE POLICY "system_owners_full_access_sources" ON sources
  FOR ALL TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'system_owner'
  )
  WITH CHECK (
    (SELECT get_user_role((SELECT auth.uid()))) = 'system_owner'
  );

-- Policy 2: Company Operators - Full access to all sources
CREATE POLICY "company_operators_full_access_sources" ON sources
  FOR ALL TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'company_operator'
  )
  WITH CHECK (
    (SELECT get_user_role((SELECT auth.uid()))) = 'company_operator'
  );

-- Policy 3: Board Members - Read-only access to all sources
CREATE POLICY "board_members_read_sources" ON sources
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'board'
  );

-- Policy 4: Administrators - Can manage their own sources
CREATE POLICY "administrators_manage_own_sources" ON sources
  FOR ALL TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'administrator'
    AND uploaded_by_user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT get_user_role((SELECT auth.uid()))) = 'administrator'
    AND uploaded_by_user_id = (SELECT auth.uid())
    AND (target_role = 'administrator' OR target_role IS NULL)
  );

-- Policy 5: Administrators - Can view other administrator sources (role-based sharing)
CREATE POLICY "administrators_view_admin_sources" ON sources
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'administrator'
    AND target_role = 'administrator'
  );

-- Policy 6: Executives - Can manage their own sources
CREATE POLICY "executives_manage_own_sources" ON sources
  FOR ALL TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'executive'
    AND uploaded_by_user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT get_user_role((SELECT auth.uid()))) = 'executive'
    AND uploaded_by_user_id = (SELECT auth.uid())
    AND (target_role IN ('executive', 'administrator') OR target_role IS NULL)
  );

-- Policy 7: Executives - Can view executive and administrator sources (role-based sharing)
CREATE POLICY "executives_view_shared_sources" ON sources
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role((SELECT auth.uid()))) = 'executive'
    AND target_role IN ('executive', 'administrator')
  );

\echo 'Adding comments...'

COMMENT ON FUNCTION can_access_source IS
'Determines if the current user can access a source document based on:
1. System Owner/Company Operator: Full access
2. Board: Read-only access to all
3. Uploader: Always can access their own uploads
4. Administrators: Can access administrator-role documents
5. Executives: Can access executive and administrator-role documents';

-- ============================================================================
-- PART 2: Storage Bucket Policies
-- ============================================================================

\echo 'Creating storage access function...'

-- Helper function to check storage access
CREATE OR REPLACE FUNCTION storage.can_access_pdf(
  bucket_name TEXT,
  file_path TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  source_record RECORD;
  user_role TEXT;
BEGIN
  -- Get user's role
  user_role := get_user_role(user_id);

  -- System Owners and Company Operators can access everything
  IF user_role IN ('system_owner', 'company_operator') THEN
    RETURN TRUE;
  END IF;

  -- Board members can access everything (read-only)
  IF user_role = 'board' THEN
    RETURN TRUE;
  END IF;

  -- Find the source record that corresponds to this file
  SELECT * INTO source_record
  FROM public.sources
  WHERE (pdf_file_path = file_path OR public.sources.file_path = storage.can_access_pdf.file_path)
    AND (pdf_storage_bucket = bucket_name OR pdf_storage_bucket IS NULL);

  -- If no source record found, deny access
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Use the can_access_source function to determine access
  RETURN can_access_source(source_record.target_role, source_record.uploaded_by_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

\echo 'Dropping existing storage policies...'

-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can read sources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own sources" ON storage.objects;
DROP POLICY IF EXISTS "sources_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "sources_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "sources_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "sources_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "role_based_read_access" ON storage.objects;
DROP POLICY IF EXISTS "authorized_users_can_upload" ON storage.objects;
DROP POLICY IF EXISTS "users_can_update_own_files" ON storage.objects;
DROP POLICY IF EXISTS "authorized_users_can_delete" ON storage.objects;
DROP POLICY IF EXISTS "role_based_read_access_policy_docs" ON storage.objects;
DROP POLICY IF EXISTS "authorized_users_can_upload_policy_docs" ON storage.objects;
DROP POLICY IF EXISTS "users_can_update_own_policy_docs" ON storage.objects;
DROP POLICY IF EXISTS "authorized_users_can_delete_policy_docs" ON storage.objects;

\echo 'Creating new storage policies...'

-- Storage policies for 'sources' bucket
CREATE POLICY "role_based_read_access" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'sources'
    AND storage.can_access_pdf(bucket_id, name, (SELECT auth.uid()))
  );

CREATE POLICY "authorized_users_can_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'sources'
    AND (
      (SELECT get_user_role((SELECT auth.uid()))) IN ('system_owner', 'company_operator')
    )
  );

CREATE POLICY "users_can_update_own_files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'sources'
    AND EXISTS (
      SELECT 1 FROM public.sources
      WHERE (pdf_file_path = name OR file_path = name)
        AND uploaded_by_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'sources'
    AND EXISTS (
      SELECT 1 FROM public.sources
      WHERE (pdf_file_path = name OR file_path = name)
        AND uploaded_by_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "authorized_users_can_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'sources'
    AND (
      (SELECT get_user_role((SELECT auth.uid()))) IN ('system_owner', 'company_operator')
      OR
      EXISTS (
        SELECT 1 FROM public.sources
        WHERE (pdf_file_path = name OR file_path = name)
          AND uploaded_by_user_id = (SELECT auth.uid())
      )
    )
  );

-- Storage policies for 'policy-documents' bucket
CREATE POLICY "role_based_read_access_policy_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'policy-documents'
    AND storage.can_access_pdf(bucket_id, name, (SELECT auth.uid()))
  );

CREATE POLICY "authorized_users_can_upload_policy_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'policy-documents'
    AND (
      (SELECT get_user_role((SELECT auth.uid()))) IN ('system_owner', 'company_operator')
    )
  );

CREATE POLICY "users_can_update_own_policy_docs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'policy-documents'
    AND EXISTS (
      SELECT 1 FROM public.sources
      WHERE (pdf_file_path = name OR file_path = name)
        AND uploaded_by_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'policy-documents'
    AND EXISTS (
      SELECT 1 FROM public.sources
      WHERE (pdf_file_path = name OR file_path = name)
        AND uploaded_by_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "authorized_users_can_delete_policy_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'policy-documents'
    AND (
      (SELECT get_user_role((SELECT auth.uid()))) IN ('system_owner', 'company_operator')
      OR
      EXISTS (
        SELECT 1 FROM public.sources
        WHERE (pdf_file_path = name OR file_path = name)
          AND uploaded_by_user_id = (SELECT auth.uid())
      )
    )
  );

\echo 'Adding storage function comment...'

COMMENT ON FUNCTION storage.can_access_pdf IS
'Checks if a user can access a PDF file in storage based on:
1. Their role (system_owner, company_operator, board have full access)
2. Whether they uploaded the file
3. Whether the target_role of the document matches their access level';

COMMIT;

\echo 'Migration completed successfully!'
\echo ''
\echo 'Summary:'
\echo '- Created can_access_source() function for RLS logic'
\echo '- Created storage.can_access_pdf() function for storage access'
\echo '- Added 7 RLS policies on sources table'
\echo '- Added 8 storage policies on storage.objects table'
\echo '- Added performance indexes'
\echo ''
\echo 'Role-based sharing is now active:'
\echo '  - Board: Can see ALL documents'
\echo '  - Administrators: Can see administrator documents + own uploads'
\echo '  - Executives: Can see executive & administrator documents + own uploads'
\echo '  - System Owner/Company Operator: Full access'
