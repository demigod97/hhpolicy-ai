-- Fix RLS policy for user_roles table to prevent infinite recursion
-- This replaces the problematic policy with a simpler one

-- First, drop the existing policy that's causing infinite recursion
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Create a new, simpler policy that doesn't cause recursion
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Also ensure we have a policy for inserts/updates if needed
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
CREATE POLICY "Users can insert their own role" ON user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own role" ON user_roles;
CREATE POLICY "Users can update their own role" ON user_roles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);