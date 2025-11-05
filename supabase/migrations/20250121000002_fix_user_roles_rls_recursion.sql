-- Fix infinite recursion in user_roles RLS policy
-- The issue is likely caused by a policy that references user_roles within itself

-- First, drop all existing RLS policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user roles" ON public.user_roles;

-- Temporarily disable RLS on user_roles to prevent recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Create a simple, non-recursive RLS policy
-- Users can only see their own roles, service role can see all
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Allow service role (used by edge functions) to bypass RLS
-- This is handled automatically by Supabase when using service role key

-- Grant necessary permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Add a comment to document this fix
COMMENT ON TABLE public.user_roles IS 'User roles table with fixed RLS policy to prevent infinite recursion';
