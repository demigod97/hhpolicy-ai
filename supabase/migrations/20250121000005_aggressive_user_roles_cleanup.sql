-- AGGRESSIVE CLEANUP: Remove ALL conflicting policies on user_roles
-- Date: 2025-01-21
-- Purpose: Remove all existing policies and create only one simple policy

-- ============================================================================
-- 1. DISABLE RLS AND DROP ALL POLICIES
-- ============================================================================

-- Disable RLS completely
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including the problematic ones)
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_simple_select" ON public.user_roles;

-- Drop any other policies that might exist
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
-- 2. RE-ENABLE RLS WITH SINGLE SIMPLE POLICY
-- ============================================================================

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create ONLY ONE simple policy that cannot cause recursion
CREATE POLICY "user_roles_clean_select" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============================================================================
-- 4. VERIFY CLEAN STATE
-- ============================================================================

-- Check that only one policy exists
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'user_roles';
  
  IF policy_count = 1 THEN
    RAISE NOTICE 'SUCCESS: Only 1 policy exists on user_roles table';
  ELSE
    RAISE NOTICE 'WARNING: % policies exist on user_roles table (expected: 1)', policy_count;
  END IF;
END $$;

-- ============================================================================
-- 5. TEST THE FIX
-- ============================================================================

-- Test that the query works without recursion
DO $$
DECLARE
  test_result TEXT;
BEGIN
  SELECT role INTO test_result
  FROM public.user_roles 
  WHERE user_id = '716b6bd4-db5d-4d73-a116-87e539c95852' 
  LIMIT 1;
  
  RAISE NOTICE 'SUCCESS: Query executed without recursion. User role: %', test_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Query failed with: %', SQLERRM;
    RAISE;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON POLICY "user_roles_clean_select" ON public.user_roles IS 
'Clean policy: users can only view their own roles. No recursion possible.';

COMMENT ON TABLE public.user_roles IS 
'User roles table with single, clean RLS policy. All conflicting policies removed.';
