-- Migration: Fix role-based source access control
-- Date: 2025-09-21
-- Description: Correct the RLS policy to ensure proper role hierarchy:
--              Board: sees all sources (administrator + executive + board)
--              Executive: sees only executive + administrator sources  
--              Administrator: sees only administrator sources

-- Drop the existing policy
DROP POLICY IF EXISTS "sources_view_policy" ON sources;

-- Create corrected RLS policy for role-based source viewing
CREATE POLICY "sources_view_policy" ON sources
FOR SELECT
USING (
  -- Get the current user's role
  CASE 
    -- Board members can see all sources
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'board'
    ) THEN true
    
    -- Executive members can see executive and administrator sources ONLY
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'executive'
    ) AND target_role IN ('executive', 'administrator') THEN true
    
    -- Administrator members can see ONLY administrator sources
    WHEN EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'administrator'  
    ) AND target_role = 'administrator' THEN true
    
    -- Default deny for any other case
    ELSE false
  END
);

-- Add comment to document the corrected hierarchy
COMMENT ON POLICY "sources_view_policy" ON sources IS 
'Fixed role hierarchy: Board sees all, Executive sees executive+administrator only, Administrator sees administrator only';