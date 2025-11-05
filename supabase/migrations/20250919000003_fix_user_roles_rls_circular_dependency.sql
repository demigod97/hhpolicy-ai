-- Migration: Fix circular dependency in user_roles RLS policies
-- Date: 2025-09-19
-- Purpose: Fix infinite recursion caused by role functions calling user_roles table with RLS policies that use role functions

-- Drop existing user_roles RLS policies that cause circular dependency
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;

-- Create simple RLS policies for user_roles that don't use role functions to avoid circular dependency
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- For now, only authenticated users can insert their own roles
-- (Super admin functionality will be handled through direct SQL or separate admin interface)
CREATE POLICY "Users can create their own roles" ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own roles (this might be restricted later)
CREATE POLICY "Users can update their own roles" ON public.user_roles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own roles
CREATE POLICY "Users can delete their own roles" ON public.user_roles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Note: Super admin access to user_roles will need to be handled differently
-- either through service role access or a separate admin interface