-- ============================================================================
-- DAY 1 DEPLOYMENT VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify all migrations deployed correctly
-- ============================================================================

-- SECTION 1: VERIFY TABLES CREATED (5 new tables expected)
-- ============================================================================
select 
  '1. NEW TABLES CREATED' as verification_section,
  string_agg(table_name, ', ' order by table_name) as tables_found,
  count(*)::text || ' of 5 expected' as status
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages');

-- SECTION 2: VERIFY USER ROLES CONSTRAINT UPDATED (5 roles)
-- ============================================================================
select 
  '2. USER ROLES CONSTRAINT' as verification_section,
  constraint_name,
  case 
    when check_clause like '%company_operator%' and check_clause like '%system_owner%' 
    then '✅ CORRECT - 5 roles found'
    else '❌ FAILED - Only 3 roles found'
  end as status,
  check_clause
from information_schema.check_constraints
where constraint_name = 'user_roles_role_check';

-- SECTION 3: VERIFY PDF STORAGE COLUMNS ADDED TO SOURCES (3 new columns)
-- ============================================================================
select 
  '3. PDF STORAGE COLUMNS' as verification_section,
  string_agg(column_name, ', ' order by column_name) as columns_found,
  count(*)::text || ' of 3 expected' as status
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'sources' 
  and column_name in ('pdf_storage_path', 'pdf_url', 'pdf_metadata');

-- SECTION 4: VERIFY HELPER FUNCTIONS CREATED (9 functions)
-- ============================================================================
select 
  '4. HELPER FUNCTIONS' as verification_section,
  string_agg(routine_name, ', ' order by routine_name) as functions_found,
  count(*)::text || ' of 9 expected' as status
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

-- SECTION 5: VERIFY SCHEDULED CRON JOB (1 job)
-- ============================================================================
select 
  '5. SCHEDULED CRON JOB' as verification_section,
  case 
    when exists (select 1 from pg_extension where extname = 'pg_cron')
    then (select jobname || ' - ' || schedule from cron.job where jobname = 'reset_daily_limits_job' limit 1)
    else '⚠️ pg_cron extension not enabled'
  end as job_status,
  case 
    when exists (select 1 from pg_extension where extname = 'pg_cron')
    then (select case when jobname = 'reset_daily_limits_job' then '✅ CORRECT' else '❌ FAILED' end from cron.job where jobname = 'reset_daily_limits_job' limit 1)
    else '⚠️ NEEDS MANUAL SETUP'
  end as status;

-- SECTION 6: VERIFY RLS POLICIES (23 new policies)
-- ============================================================================
select 
  '6. RLS POLICIES' as verification_section,
  tablename,
  count(*) as policy_count
from pg_policies 
where tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages', 'user_roles', 'policy_documents', 'sources')
group by tablename
order by tablename;

-- SECTION 7: VERIFY TABLE COLUMNS (Detailed check for each new table)
-- ============================================================================

-- 7a. API Keys table structure
select 
  '7a. API_KEYS TABLE STRUCTURE' as verification_section,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'api_keys'
order by ordinal_position;

-- 7b. Token Usage table structure
select 
  '7b. TOKEN_USAGE TABLE STRUCTURE' as verification_section,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'token_usage'
order by ordinal_position;

-- 7c. User Limits table structure
select 
  '7c. USER_LIMITS TABLE STRUCTURE' as verification_section,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'user_limits'
order by ordinal_position;

-- 7d. Chat Sessions table structure
select 
  '7d. CHAT_SESSIONS TABLE STRUCTURE' as verification_section,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'chat_sessions'
order by ordinal_position;

-- 7e. Chat Messages table structure
select 
  '7e. CHAT_MESSAGES TABLE STRUCTURE' as verification_section,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public' 
  and table_name = 'chat_messages'
order by ordinal_position;

-- SECTION 8: VERIFY INDEXES CREATED
-- ============================================================================
select 
  '8. INDEXES' as verification_section,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public' 
  and tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages', 'user_roles', 'sources')
order by tablename, indexname;

-- SECTION 9: VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================================================
select 
  '9. FOREIGN KEY RELATIONSHIPS' as verification_section,
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  tc.constraint_name
from information_schema.table_constraints as tc 
join information_schema.key_column_usage as kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage as ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY' 
  and tc.table_schema = 'public'
  and tc.table_name in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
order by tc.table_name, kcu.column_name;

-- SECTION 10: VERIFY RLS ENABLED ON ALL NEW TABLES
-- ============================================================================
select 
  '10. RLS ENABLED STATUS' as verification_section,
  schemaname,
  tablename,
  case 
    when rowsecurity then '✅ ENABLED'
    else '❌ DISABLED'
  end as rls_status
from pg_tables
where schemaname = 'public' 
  and tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
order by tablename;

-- SECTION 11: VERIFY STORAGE BUCKETS (Check if policy_documents bucket exists)
-- ============================================================================
select 
  '11. STORAGE BUCKETS' as verification_section,
  name as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where name = 'policy_documents';

-- SECTION 12: SUMMARY CHECKLIST
-- ============================================================================
select 
  '12. DEPLOYMENT SUMMARY' as verification_section,
  case 
    when (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')) = 5 
    then '✅' else '❌' 
  end || ' 5 new tables created' as check_1,
  case 
    when exists (select 1 from information_schema.check_constraints where constraint_name = 'user_roles_role_check' and check_clause like '%company_operator%')
    then '✅' else '❌' 
  end || ' User roles extended to 5' as check_2,
  case 
    when (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'sources' and column_name in ('pdf_storage_path', 'pdf_url', 'pdf_metadata')) = 3
    then '✅' else '❌' 
  end || ' PDF storage columns added' as check_3,
  case 
    when (select count(*) from information_schema.routines where routine_schema = 'public' and routine_name in ('update_api_key_updated_at', 'verify_single_default_key', 'calculate_token_cost', 'check_user_token_limit', 'increment_user_token_usage', 'reset_daily_limits', 'create_chat_session', 'add_chat_message', 'update_source_updated_at')) = 9
    then '✅' else '❌' 
  end || ' 9 helper functions created' as check_4,
  case 
    when exists (select 1 from cron.job where jobname = 'reset_daily_limits_job')
    then '✅' else '⚠️' 
  end || ' Daily reset cron job scheduled' as check_5,
  case 
    when (select count(*) from pg_policies where tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')) >= 23
    then '✅' else '❌' 
  end || ' RLS policies created (23+ expected)' as check_6,
  case 
    when (select count(*) from pg_tables where schemaname = 'public' and tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages') and rowsecurity) = 5
    then '✅' else '❌' 
  end || ' RLS enabled on all new tables' as check_7;

-- ============================================================================
-- END OF VERIFICATION SCRIPT
-- 
-- HOW TO INTERPRET RESULTS:
-- - All checks should show ✅ for successful deployment
-- - If any check shows ❌, refer to the specific section for details
-- - Expected counts: 5 tables, 9 functions, 1 cron job, 23+ policies, 3 columns
-- ============================================================================
