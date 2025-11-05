-- Update role enum from 'super_admin' to 'board'
-- This migration safely updates existing data and constraints

-- First, update any existing 'super_admin' roles to 'board'
UPDATE public.user_roles 
SET role = 'board' 
WHERE role = 'super_admin';

-- Drop the existing constraint
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add the new constraint with 'board' instead of 'super_admin'
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text]));

-- Update the role assignment constraint in policy_documents table as well
ALTER TABLE public.policy_documents 
DROP CONSTRAINT IF EXISTS policy_documents_role_assignment_check;

ALTER TABLE public.policy_documents 
ADD CONSTRAINT policy_documents_role_assignment_check 
CHECK (role_assignment = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text]));

-- Update the target_role constraint in sources table
ALTER TABLE public.sources 
DROP CONSTRAINT IF EXISTS sources_target_role_check;

ALTER TABLE public.sources 
ADD CONSTRAINT sources_target_role_check 
CHECK ((target_role = ANY (ARRAY['administrator'::text, 'executive'::text, 'board'::text])) OR target_role IS NULL);

-- Add a comment to document this change
COMMENT ON COLUMN public.user_roles.role IS 'User role: administrator, executive, or board (highest privilege)';
