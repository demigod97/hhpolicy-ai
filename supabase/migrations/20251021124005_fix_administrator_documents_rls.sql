-- Fix Administrator RLS Policy for Documents Table
-- Issue: Administrators can only view documents from sources they personally uploaded
-- Fix: Allow administrators to view documents from ANY source targeted to administrators

-- Add a new SELECT-only policy for administrators to view all administrator-targeted documents
CREATE POLICY "administrators_view_admin_documents"
ON documents
FOR SELECT
TO authenticated
USING (
  is_administrator()
  AND EXISTS (
    SELECT 1
    FROM sources s
    WHERE s.id = documents.source_id
    AND s.target_role = 'administrator'
  )
);

-- The existing administrators_manage_documents policy will continue to handle
-- INSERT/UPDATE/DELETE operations for sources they uploaded
-- This separation ensures:
-- - Admins can READ all administrator-targeted documents (for citations, document viewer)
-- - Admins can only MODIFY documents from sources they uploaded
