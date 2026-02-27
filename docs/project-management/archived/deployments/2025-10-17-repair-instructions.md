# 🔧 Day 1 Deployment Repair Instructions

## 📊 Your Current Status

Based on verification results:

| Component    | Status | Details |
|-------------|--------|---------|
| Tables      | ✅ 5/5  | All new tables created successfully |
| User Roles  | ✅ 5/5  | Extended to 5 roles correctly |
| RLS Policies| ✅ 27   | More than expected 23+ (excellent!) |
| **Functions**   | ❌ 1/9  | **MISSING 8 functions** |
| **PDF Columns** | ❌ 1/3  | **MISSING 2 columns** |
| **Cron Job**    | ❌ 0/1  | **MISSING daily reset job** |

## 🎯 What Happened

The `DEPLOY-DAY1.sql` script **partially executed** - likely hit an error mid-execution and stopped. The tables and policies were created, but several critical functions, columns, and the cron job were skipped.

## ⚡ Quick Repair (2 minutes)

### Step 1: Open SQL Editor
```
https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
```

### Step 2: Run Repair Script

**Copy the ENTIRE contents of `REPAIR-DAY1.sql` and paste into SQL Editor**, then click Run.

This repair script will:
1. ✅ Add 2 missing PDF columns to sources table
2. ✅ Create 8 missing helper functions
3. ✅ Enable pg_cron extension
4. ✅ Schedule the daily reset cron job
5. ✅ Verify everything was added correctly

**The script is safe to run multiple times** - it checks for existing components before creating.

### Step 3: Verify Repair Worked

After running `REPAIR-DAY1.sql`, you'll see verification output at the end showing:
- PDF Columns: 3 of 3 expected
- Functions: 9 of 9 expected
- Cron Job: 1 of 1 expected

### Step 4: Final Confirmation

Re-run the quick verification query:

```sql
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
    'update_api_key_updated_at', 'verify_single_default_key', 'calculate_token_cost',
    'check_user_token_limit', 'increment_user_token_usage', 'reset_daily_limits',
    'create_chat_session', 'add_chat_message', 'update_source_updated_at'
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
  count(*)::text || ' scheduled (expected: 1)'
from cron.job 
where jobname = 'reset_daily_limits_job'

union all

select 
  'RLS Policies',
  count(*)::text || ' created (expected: 23+)'
from pg_policies 
where tablename in ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages');
```

**Expected Result After Repair:**
```json
[
  { "component": "Tables", "status": "5 created (expected: 5)" },
  { "component": "Functions", "status": "9 created (expected: 9)" },
  { "component": "User Roles", "status": "Extended to 5 roles ✅" },
  { "component": "PDF Columns", "status": "3 added to sources (expected: 3)" },
  { "component": "Cron Jobs", "status": "1 scheduled (expected: 1)" },
  { "component": "RLS Policies", "status": "27 created (expected: 23+)" }
]
```

## 🎉 Success Criteria

All 6 components show correct counts:
- ✅ Tables: 5/5
- ✅ Functions: 9/9
- ✅ User Roles: 5 roles with ✅
- ✅ PDF Columns: 3/3
- ✅ Cron Job: 1/1
- ✅ RLS Policies: 27 (23+ required)

## 📝 What Each Missing Component Does

### Missing Functions (8)
1. **update_api_key_updated_at** - Trigger to auto-update timestamps
2. **verify_single_default_key** - Ensures only one default API key per user
3. **calculate_token_cost** - Calculates $ cost from token usage
4. **check_user_token_limit** - Validates before API calls
5. **increment_user_token_usage** - Tracks usage after API calls
6. **reset_daily_limits** - Resets counters daily (called by cron)
7. **create_chat_session** - Helper for chat functionality
8. **add_chat_message** - Helper for chat functionality

### Missing PDF Columns (2)
1. **pdf_storage_path** - Storage bucket path for uploaded PDFs
2. **pdf_url** - Public/signed URL for PDF access

### Missing Cron Job (1)
- **reset_daily_limits_job** - Runs daily at midnight UTC to reset token counters

## 🚨 If Repair Fails

If the repair script encounters errors:

1. **Check Error Message** - Look for specific table/function/column name
2. **Component Already Exists?** - Script has checks but DB may have partial state
3. **Permission Issues?** - Ensure you're logged in as project owner
4. **Contact Support** - Share the error message for help

## ✅ After Successful Repair

Once all 6 components show correct counts:
1. **Mark Day 1 Complete** ✅
2. **Proceed with Option 1** - Documentation updates
3. **Begin Day 2-3** - Edge Functions development

Your Day 1 deployment will be **fully operational** with:
- Complete role hierarchy (5 roles)
- Token tracking system (functions + cron)
- PDF storage support (columns)
- Chat functionality (tables + functions)
- API key management (tables + triggers)
