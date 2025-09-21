-- Migration: Assign executive role to test user and update existing document
-- Date: 2025-09-19
-- Purpose: Set up test data for role-based access control testing

-- Insert executive role for test user demi@coralshades.ai
INSERT INTO public.user_roles (user_id, role)
VALUES ('716b6bd4-db5d-4d73-a116-87e539c95852', 'executive')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing policy document to have administrator role assignment
UPDATE public.policy_documents
SET role_assignment = 'administrator'
WHERE id = '33bd367a-91ed-4ae1-ab01-7dcf4c48df15'
  AND role_assignment IS NULL;

-- Verification queries (for testing)
-- SELECT u.email, ur.role FROM auth.users u LEFT JOIN public.user_roles ur ON u.id = ur.user_id WHERE u.email = 'demi@coralshades.ai';
-- SELECT id, title, role_assignment FROM public.policy_documents WHERE id = '33bd367a-91ed-4ae1-ab01-7dcf4c48df15';