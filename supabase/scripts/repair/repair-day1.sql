-- ============================================================================
-- DAY 1 REPAIR SCRIPT
-- Run this to complete the missing components from Day 1 deployment
-- ============================================================================
-- 
-- ANALYSIS: Your verification showed:
-- ✅ Tables: 5/5 created
-- ✅ User Roles: Extended to 5
-- ✅ RLS Policies: 27 created (23+ expected)
-- ❌ Functions: 1/9 created (MISSING 8)
-- ❌ PDF Columns: 1/3 added (MISSING 2)
-- ❌ Cron Job: 0/1 scheduled (MISSING 1)
--
-- This script adds only what's missing to complete Day 1.
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING PDF COLUMNS TO SOURCES TABLE
-- ============================================================================

-- Add pdf_storage_path column (if not exists)
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'sources' 
    and column_name = 'pdf_storage_path'
  ) then
    alter table public.sources add column pdf_storage_path text;
    raise notice '✅ Added pdf_storage_path column';
  else
    raise notice '⚠️ pdf_storage_path column already exists';
  end if;
end $$;

-- Add pdf_url column (if not exists)
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'sources' 
    and column_name = 'pdf_url'
  ) then
    alter table public.sources add column pdf_url text;
    raise notice '✅ Added pdf_url column';
  else
    raise notice '⚠️ pdf_url column already exists';
  end if;
end $$;

-- Add pdf_metadata column (if not exists)
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'sources' 
    and column_name = 'pdf_metadata'
  ) then
    alter table public.sources add column pdf_metadata jsonb default '{}'::jsonb;
    raise notice '✅ Added pdf_metadata column';
  else
    raise notice '⚠️ pdf_metadata column already exists';
  end if;
end $$;

-- ============================================================================
-- PART 2: CREATE MISSING HELPER FUNCTIONS (8 functions)
-- ============================================================================

-- Function 1: update_api_key_updated_at (Trigger function for api_keys)
create or replace function public.update_api_key_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger update_api_key_updated_at_trigger
  before update on public.api_keys
  for each row
  execute function public.update_api_key_updated_at();

-- Function 2: verify_single_default_key (Constraint for api_keys)
create or replace function public.verify_single_default_key()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.is_default = true then
    update public.api_keys
    set is_default = false
    where user_id = new.user_id
      and id != new.id
      and is_default = true;
  end if;
  return new;
end;
$$;

create or replace trigger verify_single_default_key_trigger
  before insert or update on public.api_keys
  for each row
  execute function public.verify_single_default_key();

-- Function 3: calculate_token_cost (Helper for token tracking)
create or replace function public.calculate_token_cost(
  model_name text,
  prompt_tokens integer,
  completion_tokens integer
)
returns numeric
language plpgsql
security definer
as $$
declare
  prompt_cost numeric;
  completion_cost numeric;
begin
  -- Pricing per 1M tokens (as of 2024)
  case model_name
    when 'gpt-4' then
      prompt_cost := 30.0;
      completion_cost := 60.0;
    when 'gpt-4-turbo' then
      prompt_cost := 10.0;
      completion_cost := 30.0;
    when 'gpt-3.5-turbo' then
      prompt_cost := 0.5;
      completion_cost := 1.5;
    else
      prompt_cost := 1.0;
      completion_cost := 2.0;
  end case;

  return (prompt_tokens * prompt_cost / 1000000.0) + 
         (completion_tokens * completion_cost / 1000000.0);
end;
$$;

-- Function 4: check_user_token_limit (Validation before API calls)
create or replace function public.check_user_token_limit(
  p_user_id uuid,
  p_tokens_needed integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  user_limit record;
begin
  select * into user_limit
  from public.user_limits
  where user_id = p_user_id;

  if not found then
    return false;
  end if;

  return (user_limit.tokens_used_today + p_tokens_needed) <= user_limit.daily_token_limit;
end;
$$;

-- Function 5: increment_user_token_usage (Update after API calls)
create or replace function public.increment_user_token_usage(
  p_user_id uuid,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_total_tokens integer,
  p_model_name text,
  p_endpoint text
)
returns void
language plpgsql
security definer
as $$
declare
  token_cost numeric;
begin
  -- Calculate cost
  token_cost := public.calculate_token_cost(
    p_model_name,
    p_prompt_tokens,
    p_completion_tokens
  );

  -- Insert token usage record
  insert into public.token_usage (
    user_id,
    model_name,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    estimated_cost,
    endpoint,
    created_at
  ) values (
    p_user_id,
    p_model_name,
    p_prompt_tokens,
    p_completion_tokens,
    p_total_tokens,
    token_cost,
    p_endpoint,
    now()
  );

  -- Update user limits
  update public.user_limits
  set 
    tokens_used_today = tokens_used_today + p_total_tokens,
    total_tokens_used = total_tokens_used + p_total_tokens,
    total_cost = total_cost + token_cost,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- Function 6: reset_daily_limits (Scheduled daily reset)
create or replace function public.reset_daily_limits()
returns void
language plpgsql
security definer
as $$
begin
  update public.user_limits
  set 
    tokens_used_today = 0,
    reset_at = now(),
    updated_at = now();
  
  raise notice 'Daily token limits reset for all users';
end;
$$;

-- Function 7: create_chat_session (Helper for chat functionality)
create or replace function public.create_chat_session(
  p_user_id uuid,
  p_title text default 'New Chat'
)
returns uuid
language plpgsql
security definer
as $$
declare
  session_id uuid;
begin
  insert into public.chat_sessions (
    user_id,
    title,
    created_at,
    updated_at
  ) values (
    p_user_id,
    p_title,
    now(),
    now()
  )
  returning id into session_id;

  return session_id;
end;
$$;

-- Function 8: add_chat_message (Helper for chat functionality)
create or replace function public.add_chat_message(
  p_session_id uuid,
  p_role text,
  p_content text,
  p_token_count integer default 0
)
returns uuid
language plpgsql
security definer
as $$
declare
  message_id uuid;
begin
  insert into public.chat_messages (
    session_id,
    role,
    content,
    token_count,
    created_at
  ) values (
    p_session_id,
    p_role,
    p_content,
    p_token_count,
    now()
  )
  returning id into message_id;

  -- Update session updated_at
  update public.chat_sessions
  set updated_at = now()
  where id = p_session_id;

  return message_id;
end;
$$;

-- ============================================================================
-- PART 3: ENABLE PG_CRON EXTENSION AND CREATE CRON JOB
-- ============================================================================

-- Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron with schema cron;

-- Schedule daily reset job (midnight UTC)
do $$
begin
  -- Remove existing job if it exists
  perform cron.unschedule('reset_daily_limits_job');
exception
  when others then
    null; -- Job doesn't exist, continue
end $$;

-- Create the job
select cron.schedule(
  'reset_daily_limits_job',           -- Job name
  '0 0 * * *',                        -- Midnight UTC daily
  'select public.reset_daily_limits();' -- Command to execute
);

-- ============================================================================
-- VERIFICATION: Check what was added
-- ============================================================================

-- Check PDF columns
select 
  '✅ REPAIR VERIFICATION' as section,
  'PDF Columns' as component,
  string_agg(column_name, ', ' order by column_name) as found,
  count(*)::text || ' of 3 expected' as status
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'sources' 
  and column_name in ('pdf_storage_path', 'pdf_url', 'pdf_metadata')

union all

-- Check functions
select 
  '✅ REPAIR VERIFICATION',
  'Functions',
  string_agg(routine_name, ', ' order by routine_name),
  count(*)::text || ' of 9 expected'
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
  )

union all

-- Check cron job
select 
  '✅ REPAIR VERIFICATION',
  'Cron Job',
  jobname || ' - ' || schedule,
  '1 of 1 expected'
from cron.job 
where jobname = 'reset_daily_limits_job';

-- ============================================================================
-- END OF REPAIR SCRIPT
-- 
-- NEXT STEPS:
-- 1. Review the verification output above
-- 2. Re-run QUICK-VERIFY.sql to confirm all components now show ✅
-- 3. Expected results after repair:
--    - Tables: 5/5 ✅
--    - Functions: 9/9 ✅
--    - User Roles: 5 roles ✅
--    - PDF Columns: 3/3 ✅
--    - Cron Job: 1/1 ✅
--    - RLS Policies: 27 ✅
-- ============================================================================
