-- ============================================================================
-- Migration: Update Role Functions for New Roles
-- Epic 1.5: Role Hierarchy & Access Control
-- Story 1.5.1: Update helper functions to support company_operator and system_owner
-- 
-- This migration updates existing role functions to support the new 5-role hierarchy:
-- 1. system_owner (highest)
-- 2. company_operator
-- 3. board
-- 4. administrator
-- 5. executive (lowest)
-- ============================================================================

-- Update get_user_role function to include new roles in hierarchy
CREATE OR REPLACE FUNCTION get_user_role(user_id_param UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = COALESCE(user_id_param, auth.uid())
    ORDER BY
        CASE role
            WHEN 'system_owner' THEN 1
            WHEN 'company_operator' THEN 2
            WHEN 'board' THEN 3
            WHEN 'administrator' THEN 4
            WHEN 'executive' THEN 5
            ELSE 6
        END
    LIMIT 1;
$$;

-- Update get_user_role_safe function
CREATE OR REPLACE FUNCTION get_user_role_safe(user_id_param UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = COALESCE(user_id_param, auth.uid())
  ORDER BY
      CASE role
          WHEN 'system_owner' THEN 1
          WHEN 'company_operator' THEN 2
          WHEN 'board' THEN 3
          WHEN 'administrator' THEN 4
          WHEN 'executive' THEN 5
          ELSE 6
      END
  LIMIT 1;
$$;

-- Create function to check if user has company_operator role
CREATE OR REPLACE FUNCTION is_company_operator(user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = COALESCE(user_id_param, auth.uid())
        AND role = 'company_operator'
    );
$$;

-- Create function to check if user has system_owner role
CREATE OR REPLACE FUNCTION is_system_owner(user_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = COALESCE(user_id_param, auth.uid())
        AND role = 'system_owner'
    );
$$;

-- Create function to get user role hierarchy level
CREATE OR REPLACE FUNCTION get_user_role_hierarchy_level(user_id_param UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        CASE role
            WHEN 'system_owner' THEN 1
            WHEN 'company_operator' THEN 2
            WHEN 'board' THEN 3
            WHEN 'administrator' THEN 4
            WHEN 'executive' THEN 5
            ELSE 6
        END
    FROM public.user_roles
    WHERE user_id = COALESCE(user_id_param, auth.uid())
    ORDER BY
        CASE role
            WHEN 'system_owner' THEN 1
            WHEN 'company_operator' THEN 2
            WHEN 'board' THEN 3
            WHEN 'administrator' THEN 4
            WHEN 'executive' THEN 5
            ELSE 6
        END
    LIMIT 1;
$$;

-- Create function to validate role assignments
CREATE OR REPLACE FUNCTION can_assign_role(assigner_id UUID, target_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur1
        WHERE ur1.user_id = assigner_id
        AND (
            -- System owners can assign any role
            ur1.role = 'system_owner'
            OR
            -- Company operators can assign all roles except system_owner
            (ur1.role = 'company_operator' AND target_role != 'system_owner')
        )
    );
$$;

-- Update assign_document_role function to support new roles
CREATE OR REPLACE FUNCTION assign_document_role(
    document_id UUID,
    target_role TEXT,
    user_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  row_count INTEGER;
BEGIN
  UPDATE public.policy_documents
  SET
    role_assignment = target_role,
    updated_at = NOW()
  WHERE id = document_id
    AND user_id = COALESCE(user_id_param, auth.uid())
    AND target_role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner');

  GET DIAGNOSTICS row_count = ROW_COUNT;
  RETURN row_count > 0;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_role(UUID) IS 'Returns the highest privilege role for a user in the 5-role hierarchy';
COMMENT ON FUNCTION is_company_operator(UUID) IS 'Checks if user has company_operator role';
COMMENT ON FUNCTION is_system_owner(UUID) IS 'Checks if user has system_owner role';
COMMENT ON FUNCTION get_user_role_hierarchy_level(UUID) IS 'Returns numeric hierarchy level (1=system_owner, 5=executive)';
COMMENT ON FUNCTION can_assign_role(UUID, TEXT) IS 'Validates if user can assign the specified role to others';
COMMENT ON FUNCTION assign_document_role(UUID, TEXT, UUID) IS 'Assigns document to target role, supports all 5 roles';
