-- ============================================================================
-- ADD USER ROLES TABLE AND ROLE ASSIGNMENT FIELDS
-- Story 1.2: Initial Database Schema & Role Setup
-- This migration adds user_roles table and role assignment functionality
-- ============================================================================

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'executive', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role) -- Prevent duplicate role assignments
);

-- Add role assignment field to policy_documents table
ALTER TABLE public.policy_documents
ADD COLUMN IF NOT EXISTS role_assignment TEXT CHECK (role_assignment IN ('administrator', 'executive'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_policy_documents_role_assignment ON public.policy_documents(role_assignment);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles table
-- Super admins can view all roles
CREATE POLICY "Super admins can view all roles" ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Only super admins can insert/update/delete roles
CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Add updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime subscription for user_roles
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = COALESCE(user_id_param, auth.uid())
    ORDER BY
        CASE role
            WHEN 'super_admin' THEN 1
            WHEN 'administrator' THEN 2
            WHEN 'executive' THEN 3
            ELSE 4
        END
    LIMIT 1;
$$;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT, user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = COALESCE(user_id_param, auth.uid())
        AND role = required_role
    );
$$;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT public.has_role('super_admin', user_id_param);
$$;

-- Update policy_documents RLS policies to include super admin access
-- Super admins can view all policy documents
DROP POLICY IF EXISTS "Super admins can view all policy documents" ON public.policy_documents;
CREATE POLICY "Super admins can view all policy documents" ON public.policy_documents
    FOR SELECT
    USING (public.is_super_admin());

-- Keep existing user ownership policy but make it secondary
-- Users can view their own policy documents OR super admins can view all
DROP POLICY IF EXISTS "Users can view their own policy documents" ON public.policy_documents;
CREATE POLICY "Users can view their own policy documents" ON public.policy_documents
    FOR SELECT
    USING (auth.uid() = user_id OR public.is_super_admin());

-- Update other CRUD policies to allow super admin access
DROP POLICY IF EXISTS "Users can create their own policy documents" ON public.policy_documents;
CREATE POLICY "Users can create their own policy documents" ON public.policy_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can update their own policy documents" ON public.policy_documents;
CREATE POLICY "Users can update their own policy documents" ON public.policy_documents
    FOR UPDATE
    USING (auth.uid() = user_id OR public.is_super_admin());

DROP POLICY IF EXISTS "Users can delete their own policy documents" ON public.policy_documents;
CREATE POLICY "Users can delete their own policy documents" ON public.policy_documents
    FOR DELETE
    USING (auth.uid() = user_id OR public.is_super_admin());

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert comment for migration tracking
COMMENT ON TABLE public.user_roles IS 'User role assignments for PolicyAi RBAC - Story 1.2';
COMMENT ON COLUMN public.policy_documents.role_assignment IS 'Target role for this policy document (administrator/executive)';