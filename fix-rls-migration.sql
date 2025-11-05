-- Migration to fix RLS policy infinite recursion on user_roles table
-- Apply this in Supabase Dashboard > SQL Editor

BEGIN;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role" ON user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMIT;