-- Quick verification query (Run this first for instant status check)
-- Copy and paste into Supabase SQL Editor

select 
  'Tables' as component,
  count(*)::text || ' created (expected: 5)' as status
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')

union all

select 
  'Functions',
  count(*)::text || ' created (expected: 9)'
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

select 
  'User Roles',
  case 
    when exists (
      select 1 from information_schema.check_constraints 
      where constraint_name = 'user_roles_role_check' 
      and check_clause like '%company_operator%'
      and check_clause like '%system_owner%'
    )
    then 'Extended to 5 roles ✅'
    else 'Still 3 roles ❌'
  end
from (select 1) t

union all

select 
  'PDF Columns',
  count(*)::text || ' added to sources (expected: 3)'
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'sources' 
  and column_name in ('pdf_storage_path', 'pdf_url', 'pdf_metadata')

union all

select 
  'Cron Jobs',
  case 
    when exists (select 1 from pg_extension where extname = 'pg_cron')
    then (select count(*)::text || ' scheduled (expected: 1)' from cron.job where jobname = 'reset_daily_limits_job')
    else '⚠️ pg_cron extension not enabled - needs manual setup'
  end
from (select 1) t

union all

select 
  'RLS Policies',
  count(*)::text || ' created (expected: 23+)'
from pg_policies 
where tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages');
