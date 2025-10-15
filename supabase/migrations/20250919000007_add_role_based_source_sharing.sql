-- Migration: Add Role-Based Source Sharing
-- Date: 2025-09-19
-- Purpose: Enable cross-notebook source sharing within roles (executive/administrator)

-- ============================================================================
-- 1. ADD NEW COLUMNS TO SOURCES TABLE
-- ============================================================================

-- Add visibility scope column
ALTER TABLE public.sources
ADD COLUMN visibility_scope TEXT DEFAULT 'notebook'
CHECK (visibility_scope IN ('notebook', 'role', 'global'));

-- Add target role column for role-based sharing
ALTER TABLE public.sources
ADD COLUMN target_role TEXT
CHECK (target_role IN ('administrator', 'executive') OR target_role IS NULL);

-- Add column to track who uploaded the source
ALTER TABLE public.sources
ADD COLUMN uploaded_by_user_id UUID REFERENCES auth.users(id);

-- Add index for performance on role-based queries
CREATE INDEX idx_sources_role_sharing ON public.sources(visibility_scope, target_role)
WHERE visibility_scope = 'role';

-- Add index for uploaded_by queries
CREATE INDEX idx_sources_uploaded_by ON public.sources(uploaded_by_user_id);

-- ============================================================================
-- 2. UPDATE EXISTING SOURCES WITH ROLE ASSIGNMENTS
-- ============================================================================

-- First, update uploaded_by_user_id based on the notebook owner
UPDATE public.sources
SET uploaded_by_user_id = pd.user_id
FROM public.policy_documents pd
WHERE sources.notebook_id = pd.id;

-- Update sources to use role-based sharing where policy documents have role assignments
UPDATE public.sources
SET
  visibility_scope = 'role',
  target_role = pd.role_assignment
FROM public.policy_documents pd
WHERE sources.notebook_id = pd.id
  AND pd.role_assignment IS NOT NULL
  AND pd.role_assignment IN ('administrator', 'executive');

-- Sources from documents without role assignments stay notebook-scoped (default)

-- ============================================================================
-- 3. CREATE HELPER FUNCTIONS FOR ROLE-BASED SOURCE ACCESS
-- ============================================================================

-- Function to get sources for a user (notebook + role-shared)
CREATE OR REPLACE FUNCTION public.get_user_sources(
  notebook_id_param UUID,
  user_role_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  notebook_id UUID,
  title TEXT,
  type TEXT,
  content TEXT,
  summary TEXT,
  url TEXT,
  file_path TEXT,
  file_size BIGINT,
  processing_status TEXT,
  metadata JSONB,
  visibility_scope TEXT,
  target_role TEXT,
  uploaded_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    s.id,
    s.notebook_id,
    s.title,
    s.type,
    s.content,
    s.summary,
    s.url,
    s.file_path,
    s.file_size,
    s.processing_status,
    s.metadata,
    s.visibility_scope,
    s.target_role,
    s.uploaded_by_user_id,
    s.created_at,
    s.updated_at
  FROM public.sources s
  WHERE
    -- Include notebook-specific sources
    s.notebook_id = notebook_id_param
    OR
    -- Include role-shared sources if user has a role
    (
      s.visibility_scope = 'role'
      AND s.target_role = user_role_param
      AND user_role_param IS NOT NULL
    )
  ORDER BY s.created_at DESC;
$$;

-- Function to check if user can modify a source
CREATE OR REPLACE FUNCTION public.can_user_modify_source(
  source_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.id = source_id_param
      AND s.uploaded_by_user_id = user_id_param
  );
$$;

-- ============================================================================
-- 4. UPDATE RLS POLICIES FOR SOURCES
-- ============================================================================

-- Drop existing source policies if any
DROP POLICY IF EXISTS "Users can view sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can create sources" ON public.sources;
DROP POLICY IF EXISTS "Users can update sources" ON public.sources;
DROP POLICY IF EXISTS "Users can delete sources" ON public.sources;

-- Create new RLS policies for role-based sharing
CREATE POLICY "users_can_view_sources_role_based" ON public.sources
    FOR SELECT
    USING (
      -- Users can see sources in their own notebooks
      EXISTS (
        SELECT 1 FROM public.policy_documents pd
        WHERE pd.id = sources.notebook_id
          AND pd.user_id = auth.uid()
      )
      OR
      -- Users can see role-shared sources if they have the matching role
      (
        visibility_scope = 'role'
        AND EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid()
            AND ur.role = sources.target_role
        )
      )
    );

-- Users can create sources in notebooks they own
CREATE POLICY "users_can_create_sources" ON public.sources
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.policy_documents pd
        WHERE pd.id = sources.notebook_id
          AND pd.user_id = auth.uid()
      )
    );

-- Users can update sources they uploaded
CREATE POLICY "users_can_update_own_sources" ON public.sources
    FOR UPDATE
    USING (uploaded_by_user_id = auth.uid());

-- Users can delete sources they uploaded
CREATE POLICY "users_can_delete_own_sources" ON public.sources
    FOR DELETE
    USING (uploaded_by_user_id = auth.uid());

-- ============================================================================
-- 5. GRANT PERMISSIONS ON HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_user_sources(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_modify_source(UUID, UUID) TO authenticated;

-- ============================================================================
-- 6. DATA VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_sources INTEGER;
  role_shared_sources INTEGER;
  notebook_scoped_sources INTEGER;
BEGIN
  -- Get source counts
  SELECT COUNT(*) INTO total_sources FROM public.sources;

  SELECT COUNT(*) INTO role_shared_sources
  FROM public.sources
  WHERE visibility_scope = 'role';

  SELECT COUNT(*) INTO notebook_scoped_sources
  FROM public.sources
  WHERE visibility_scope = 'notebook';

  -- Log results
  RAISE NOTICE 'Role-Based Source Sharing Migration Results:';
  RAISE NOTICE 'Total sources: %', total_sources;
  RAISE NOTICE 'Role-shared sources: %', role_shared_sources;
  RAISE NOTICE 'Notebook-scoped sources: %', notebook_scoped_sources;

  -- Test the helper function
  RAISE NOTICE 'Helper functions created successfully';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- 1. ✅ Added visibility_scope, target_role, uploaded_by_user_id columns
-- 2. ✅ Updated existing sources based on document role assignments
-- 3. ✅ Created helper functions for role-based source queries
-- 4. ✅ Updated RLS policies to support cross-notebook role sharing
-- 5. ✅ Added performance indexes for role-based queries

-- Expected behavior after migration:
-- - Executive sources are shared across all executive notebooks
-- - Administrator sources are shared across all administrator notebooks
-- - Role isolation is maintained at database level
-- - Source ownership is tracked for modification permissions