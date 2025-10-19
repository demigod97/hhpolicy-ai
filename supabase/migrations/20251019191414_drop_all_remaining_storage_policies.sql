-- ============================================================================
-- Drop ALL Storage Policies
-- Date: 2025-10-20
-- Purpose: Ensure no storage policies remain that could cause ambiguous column errors
-- ============================================================================

-- Get list of all policies on storage.objects
-- Then drop them all

-- Drop any policy that might exist on storage.objects
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- Verify no policies remain
select
  count(*) as remaining_policies,
  'All storage policies dropped' as status
from pg_policies
where schemaname = 'storage'
and tablename = 'objects';
