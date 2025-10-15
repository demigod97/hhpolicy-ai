-- Migration: Implement global sources with role-based filtering
-- Date: 2025-09-21
-- Description: Update sources to use global visibility with role-based access control
--              Board: sees all sources
--              Executive: sees executive + administrator sources  
--              Administrator: sees only administrator sources

-- First, update existing sources to be globally visible
UPDATE sources 
SET visibility_scope = 'global'
WHERE visibility_scope = 'role';

-- Create new RLS policy for role-based source viewing
DROP POLICY IF EXISTS "sources_view_policy" ON sources;

CREATE POLICY "sources_view_policy" ON sources
FOR SELECT
USING (
  -- Allow viewing if user has appropriate role based on target_role
  CASE 
    -- Board members can see all sources
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'board'
    ) THEN true
    
    -- Executive members can see executive and administrator sources
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'executive'
    ) AND target_role IN ('executive', 'administrator') THEN true
    
    -- Administrator members can see only administrator sources
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'administrator'
    ) AND target_role = 'administrator' THEN true
    
    -- Default deny
    ELSE false
  END
);

-- Update insert policy to allow any authenticated user to insert sources
DROP POLICY IF EXISTS "sources_insert_policy" ON sources;

CREATE POLICY "sources_insert_policy" ON sources
FOR INSERT
WITH CHECK (
  -- Any authenticated user can insert sources
  auth.role() = 'authenticated'
);

-- Update update policy for source management
DROP POLICY IF EXISTS "sources_update_policy" ON sources;

CREATE POLICY "sources_update_policy" ON sources
FOR UPDATE
USING (
  -- Users can update sources they uploaded or if they are board members
  uploaded_by_user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'board'
  )
);

-- Update delete policy for source management  
DROP POLICY IF EXISTS "sources_delete_policy" ON sources;

CREATE POLICY "sources_delete_policy" ON sources
FOR DELETE
USING (
  -- Users can delete sources they uploaded or if they are board members
  uploaded_by_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'board'
  )
);

-- Add comment to document the change
COMMENT ON POLICY "sources_view_policy" ON sources IS 
'Role-based source viewing: Board sees all, Executive sees executive+administrator, Administrator sees only administrator';