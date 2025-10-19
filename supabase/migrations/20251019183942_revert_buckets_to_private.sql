-- ============================================================================
-- Revert Storage Buckets to Private
-- Date: 2025-10-19
-- Purpose: Restore security by making buckets private after fixing the ambiguous column error
-- ============================================================================

-- Revert buckets to private (proper security setting)
update storage.buckets
set public = false
where id in ('sources', 'policy-documents');

-- Verify the change
select
  id,
  name,
  public,
  'Reverted to private - security restored' as note
from storage.buckets
where id in ('sources', 'policy-documents');
