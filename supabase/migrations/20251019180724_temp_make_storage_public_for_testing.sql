-- ============================================================================
-- TEMPORARY: Make Storage Public for Testing
-- Date: 2025-10-19
-- Purpose: Test if storage policies are causing 400 errors
-- WARNING: This makes buckets PUBLIC - for testing only!
-- ============================================================================

-- TEMPORARY: Make buckets public to bypass all storage policies
-- This will help us confirm if storage policies are the root cause
update storage.buckets
set public = true
where id in ('sources', 'policy-documents');

-- Add comment to remind this is temporary
comment on table storage.buckets is
'WARNING: Buckets temporarily set to PUBLIC for testing PDF access issue.
If admin/executive users can now view PDFs, storage policies are the problem.
Revert to private and implement service role or edge function approach.
See FINAL-FIX-PLAN.md for details.';

-- Log this change
select
  id,
  name,
  public,
  'Temporarily made public for testing' as note
from storage.buckets
where id in ('sources', 'policy-documents');
