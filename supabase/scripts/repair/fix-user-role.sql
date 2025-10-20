-- Manual User Role Fix for demi@coralshades.ai
-- Execute this in Supabase SQL Editor

-- First, let's find the correct user ID for demi@coralshades.ai
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'demi@coralshades.ai';

-- Check existing user_roles
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  u.email,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id;

-- If the user ID 716b6bd4-db5d-4d73-a116-87e539c95852 is correct for demi@coralshades.ai,
-- then the existing record is already correct and we don't need to change anything!