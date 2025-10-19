-- ============================================================================
-- ADD MISSING FUNCTION: update_source_updated_at
-- ============================================================================
-- This trigger function updates the updated_at timestamp on sources table
-- It should already exist from the original PRD, but adding it here to ensure
-- Day 1 verification passes completely.
-- ============================================================================

-- Create the trigger function
create or replace function public.update_source_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create the trigger (if not exists)
drop trigger if exists update_source_updated_at_trigger on public.sources;

create trigger update_source_updated_at_trigger
  before update on public.sources
  for each row
  execute function public.update_source_updated_at();

-- Verify the function exists
select 
  'VERIFICATION' as status,
  count(*)::text || ' of 9 expected' as functions_count
from information_schema.routines 
where routine_schema = 'public' 
  and routine_name in (
    'update_api_key_updated_at',
    'verify_single_default_key',
    'calculate_token_cost',
    'check_user_token_limit',
    'increment_user_token_usage',
    'reset_daily_limits',
    'create_chat_session',
    'add_chat_message',
    'update_source_updated_at'
  );
