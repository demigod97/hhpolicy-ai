-- ============================================================================
-- Fix Sources Metadata and Storage Configuration
-- Date: 2025-10-19
-- Purpose: Fix missing target_role and pdf_storage_bucket values
-- ============================================================================

-- Set default storage bucket for documents with NULL pdf_storage_bucket
-- This ensures storage policies can properly check access
UPDATE sources
SET pdf_storage_bucket = 'sources'
WHERE pdf_storage_bucket IS NULL
  AND pdf_file_path IS NOT NULL
  AND type = 'pdf';

-- For documents with NULL target_role, set to 'administrator' as default
-- This makes them accessible to executives and board members
-- Operators can later reassign roles through the management UI
UPDATE sources
SET target_role = 'administrator'
WHERE target_role IS NULL
  AND type = 'pdf';

-- Add helpful comment
COMMENT ON COLUMN sources.pdf_storage_bucket IS
'Storage bucket name where the PDF file is stored. Should be either "sources" or "policy-documents". Required for storage policy checks.';

COMMENT ON COLUMN sources.target_role IS
'The role that can access this document. NULL means accessible to all authenticated users. Values: administrator, executive, board, company_operator, system_owner';
