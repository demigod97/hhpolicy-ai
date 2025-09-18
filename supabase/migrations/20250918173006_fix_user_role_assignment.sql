-- Fix User Role Assignment for Correct User ID
-- Date: 2025-09-18
-- Purpose: Update user_roles to use correct user ID for demi@coralshades.ai

-- Clear existing test data
DELETE FROM public.user_roles;

-- Insert the correct user's executive role
INSERT INTO public.user_roles (user_id, role)
VALUES ('499982b7-d32d-4c96-b2e0-8d0c938f002f', 'executive')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the insertion
DO $$
DECLARE
  user_role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_role_count
  FROM public.user_roles
  WHERE user_id = '499982b7-d32d-4c96-b2e0-8d0c938f002f'
    AND role = 'executive';

  RAISE NOTICE 'User roles assigned for demi@coralshades.ai: %', user_role_count;
END $$;