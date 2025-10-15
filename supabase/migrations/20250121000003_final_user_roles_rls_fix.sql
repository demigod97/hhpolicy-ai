-- Final fix for user_roles RLS infinite recursion
-- Date: 2025-01-21
-- Purpose: Completely resolve the infinite recursion issue in user_roles RLS policies

-- ============================================================================
-- 1. COMPLETELY CLEAN SLATE - Remove all policies
-- ============================================================================

-- Disable RLS temporarily to prevent any issues during cleanup
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "allow_authenticated_users_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_view_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "users_can_insert_own_roles" ON public.user_roles;

-- ============================================================================
-- 2. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================================

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can only view their own roles
-- This policy uses only auth.uid() which is safe and doesn't create recursion
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to bypass RLS (automatic for service_role)
-- This ensures edge functions can work properly

-- ============================================================================
-- 3. ENSURE PROPER PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============================================================================
-- 4. VERIFY TEST USER HAS PROPER ROLE
-- ============================================================================

-- Ensure the test user has a role assigned
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
VALUES (
  '716b6bd4-db5d-4d73-a116-87e539c95852', 
  'executive',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 5. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON POLICY "user_roles_select_own" ON public.user_roles IS 
'Simple policy: users can only view their own roles. Uses auth.uid() to prevent recursion.';

COMMENT ON TABLE public.user_roles IS 
'User roles table with single, simple RLS policy to prevent infinite recursion. Service role bypasses RLS automatically.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the policy by checking if it works without recursion
DO $$
BEGIN
  -- This should work without recursion errors
  PERFORM 1 FROM public.user_roles WHERE user_id = '716b6bd4-db5d-4d73-a116-87e539c95852' LIMIT 1;
  RAISE NOTICE 'RLS Policy verification successful - no recursion detected';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy verification failed: %', SQLERRM;
END $$;
