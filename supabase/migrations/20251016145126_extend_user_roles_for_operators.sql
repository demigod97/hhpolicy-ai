-- ============================================================================
-- Migration: Extend User Roles for Company Operator and System Owner
-- Epic 1.5: Role Hierarchy & Access Control
-- Story 1.5.1: Add Company Operator & System Owner roles to database
-- 
-- This migration extends the user_roles table to support 5 roles total:
-- - board (existing)
-- - administrator (existing)
-- - executive (existing)
-- - company_operator (new)
-- - system_owner (new)
-- ============================================================================

-- Drop existing role constraint
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add new role constraint with 5 roles
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Update role_assignment constraints on related tables
ALTER TABLE public.policy_documents
DROP CONSTRAINT IF EXISTS policy_documents_role_assignment_check;

ALTER TABLE public.policy_documents
ADD CONSTRAINT policy_documents_role_assignment_check
CHECK (role_assignment IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Add target_role constraint update for sources table
ALTER TABLE public.sources
DROP CONSTRAINT IF EXISTS sources_target_role_check;

ALTER TABLE public.sources
ADD CONSTRAINT sources_target_role_check
CHECK (target_role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Create index for new roles
CREATE INDEX IF NOT EXISTS idx_user_roles_company_operator 
ON public.user_roles(user_id) 
WHERE role = 'company_operator';

CREATE INDEX IF NOT EXISTS idx_user_roles_system_owner 
ON public.user_roles(user_id) 
WHERE role = 'system_owner';

-- Update RLS policies to include new roles

-- Company operators can view all users (for role assignment)
CREATE POLICY "company_operators_view_users" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner', 'board')
  )
);

-- Company operators can assign roles (but not system_owner role)
CREATE POLICY "company_operators_assign_roles" ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('company_operator', 'system_owner')
  )
  AND (
    role != 'system_owner' OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = auth.uid()
      AND ur2.role = 'system_owner'
    )
  )
);

-- System owners have full role management
CREATE POLICY "system_owners_manage_all_roles" ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Company operators can upload documents
-- FIXED: Changed user_id to uploaded_by_user_id to match sources table schema
CREATE POLICY "company_operators_upload_documents" ON public.sources
FOR INSERT
WITH CHECK (
  uploaded_by_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner', 'board', 'administrator')
  )
);

-- Update document access for new roles
-- System owners see everything
CREATE POLICY "system_owners_view_all_sources" ON public.sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Company operators see all documents they need for operations
CREATE POLICY "company_operators_view_operational_sources" ON public.sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'company_operator'
  )
  AND (
    target_role IN ('administrator', 'executive', 'company_operator') OR
    target_role IS NULL
  )
);

-- Add comment
COMMENT ON CONSTRAINT user_roles_role_check ON public.user_roles IS 
'Updated role hierarchy: board, administrator, executive, company_operator, system_owner';

