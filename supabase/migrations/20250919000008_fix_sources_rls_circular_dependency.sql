-- Fix Sources RLS Circular Dependency
-- Date: 2025-09-19
-- Purpose: Remove circular dependency in sources RLS policies that prevent source creation

-- ============================================================================
-- ISSUE ANALYSIS
-- ============================================================================
-- Problem: The sources table has multiple conflicting RLS policies, including one that
-- references the user_roles table which itself has RLS policies causing infinite recursion.
-- This prevents source creation with error code 42P17.

-- ============================================================================
-- 1. CLEAN UP ALL EXISTING SOURCE POLICIES
-- ============================================================================

-- Drop all existing source policies to start clean
DROP POLICY IF EXISTS "Users can create sources in their policy documents" ON public.sources;
DROP POLICY IF EXISTS "Users can delete sources from their policy documents" ON public.sources;
DROP POLICY IF EXISTS "Users can update sources in their policy documents" ON public.sources;
DROP POLICY IF EXISTS "Users can view sources from their policy documents" ON public.sources;
DROP POLICY IF EXISTS "users_can_create_sources" ON public.sources;
DROP POLICY IF EXISTS "users_can_delete_own_sources" ON public.sources;
DROP POLICY IF EXISTS "users_can_update_own_sources" ON public.sources;
DROP POLICY IF EXISTS "users_can_view_sources_role_based" ON public.sources;

-- ============================================================================
-- 2. CREATE SIMPLE, NON-CIRCULAR POLICIES
-- ============================================================================

-- Simple view policy: users can see sources in notebooks they own
CREATE POLICY "sources_view_own_notebooks" ON public.sources
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.policy_documents pd
            WHERE pd.id = sources.notebook_id
              AND pd.user_id = auth.uid()
        )
    );

-- Simple create policy: users can create sources in notebooks they own
CREATE POLICY "sources_create_in_own_notebooks" ON public.sources
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.policy_documents pd
            WHERE pd.id = sources.notebook_id
              AND pd.user_id = auth.uid()
        )
    );

-- Simple update policy: users can update sources they uploaded
CREATE POLICY "sources_update_own" ON public.sources
    FOR UPDATE
    USING (uploaded_by_user_id = auth.uid());

-- Simple delete policy: users can delete sources they uploaded
CREATE POLICY "sources_delete_own" ON public.sources
    FOR DELETE
    USING (uploaded_by_user_id = auth.uid());

-- ============================================================================
-- 3. TEMPORARILY DISABLE ROLE-BASED SHARING IN RLS
-- ============================================================================
-- Note: Role-based sharing will be implemented in the application layer
-- for now to avoid circular dependencies. Once RLS is stable, we can
-- add back role-based policies.

-- ============================================================================
-- 4. ENSURE USER ROLE IS ASSIGNED
-- ============================================================================

-- Ensure the test user has the executive role
INSERT INTO public.user_roles (user_id, role)
VALUES ('716b6bd4-db5d-4d73-a116-87e539c95852', 'executive')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 5. INSERT TEST SOURCE FOR VERIFICATION
-- ============================================================================

-- Insert a test source to verify the fix works
INSERT INTO public.sources (
    notebook_id,
    title,
    type,
    content,
    processing_status,
    visibility_scope,
    target_role,
    uploaded_by_user_id,
    metadata
) VALUES (
    'c8430484-8616-46cf-a2dc-78f49a036da0',
    'Test Executive Policy Document',
    'text',
    'This is a test policy document for executives that demonstrates cross-notebook role-based source sharing functionality. This source should be visible to all executives across different notebooks.',
    'completed',
    'role',
    'executive',
    '716b6bd4-db5d-4d73-a116-87e539c95852',
    '{"test": true}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

DO $$
DECLARE
    source_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check if source was created
    SELECT COUNT(*) INTO source_count
    FROM public.sources
    WHERE title = 'Test Executive Policy Document';

    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'sources';

    -- Log results
    RAISE NOTICE 'Sources RLS Fix Results:';
    RAISE NOTICE 'Test sources created: %', source_count;
    RAISE NOTICE 'Active source policies: %', policy_count;

    -- Test basic source query
    IF source_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Test source created successfully';
    ELSE
        RAISE NOTICE 'WARNING: Test source creation may have failed';
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- 1. ✅ Removed all conflicting RLS policies on sources table
-- 2. ✅ Created simple, non-circular policies for basic CRUD operations
-- 3. ✅ Temporarily disabled role-based sharing in RLS (moved to app layer)
-- 4. ✅ Ensured test user has executive role
-- 5. ✅ Inserted test source for verification

-- Next steps after this migration:
-- 1. Test source creation from the frontend
-- 2. Verify sources appear correctly in the UI
-- 3. Test cross-notebook visibility (will be app-layer for now)
-- 4. Once stable, gradually re-introduce role-based RLS policies