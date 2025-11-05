-- TEMPORARY: Disable RLS on user_roles table to fix circular dependency
-- This is a temporary fix to allow testing while we work on a proper solution
-- In production, we'll need a more sophisticated approach

-- Disable RLS on user_roles table temporarily
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Insert the test user role we need for testing
INSERT INTO public.user_roles (user_id, role)
VALUES ('716b6bd4-db5d-4d73-a116-87e539c95852', 'executive')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing policy document to have administrator role assignment
UPDATE public.policy_documents
SET role_assignment = 'administrator'
WHERE id = '33bd367a-91ed-4ae1-ab01-7dcf4c48df15'
  AND role_assignment IS NULL;

-- Note: This is temporary for testing. In production, user_roles should have proper RLS policies
-- that don't create circular dependencies with the role checking functions.