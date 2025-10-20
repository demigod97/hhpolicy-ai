# ✅ Day 1 Deployment Verification - Quick Instructions

## 🎯 Your Mission

Verify that all Day 1 database migrations deployed successfully via SQL Editor.

---

## ⚡ FASTEST METHOD (30 seconds)

### Step 1: Open SQL Editor
```
https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
```

### Step 2: Run Quick Check

Copy this entire query and paste into SQL Editor:

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

### Step 3: Check Results

**✅ SUCCESS if you see:**
- Tables: 5 created (expected: 5)
- Functions: 9 created (expected: 9)
- User Roles: Extended to 5 roles ✅
- PDF Columns: 3 added to sources (expected: 3)
- Cron Jobs: 1 scheduled (expected: 1)
- RLS Policies: 23 created (expected: 23+)

**❌ FAILURE if any count is wrong or you see "Still 3 roles ❌"**

---

## 📁 Verification Files Available

**Option 1: Quick Check (30 seconds)**
- File: `QUICK-VERIFY.sql`
- Use: Fast status check

**Option 2: Comprehensive Check (5 minutes)**
- File: `VERIFY-DAY1-DEPLOYMENT.sql`
- Use: Detailed validation of all components

**Option 3: Full Guide (reference)**
- File: `VERIFICATION-GUIDE.md`
- Use: Complete documentation with troubleshooting

---

## 🎯 What Day 1 Deployed

### 5 New Tables:
1. **api_keys** - Encrypted API key storage (OpenAI, Gemini, Mistral, Anthropic)
2. **token_usage** - Token tracking with cost estimation
3. **user_limits** - Daily/monthly quotas and rate limiting
4. **chat_sessions** - Native chat sessions (replaces n8n)
5. **chat_messages** - Chat message history

### Extended Existing Tables:
- **user_roles** - Now supports 5 roles (was 3)
- **sources** - Added 3 PDF storage columns

### 9 Helper Functions:
- API key management (2 functions)
- Token tracking (3 functions)
- Daily reset (1 function)
- Chat helpers (2 functions)
- Timestamp triggers (1 function)

### 1 Cron Job:
- **reset_daily_limits_job** - Runs at midnight UTC daily

### 23+ RLS Policies:
- Role-based access control across all new tables

---

## 🚨 If Verification Fails

### Tables Missing?
Re-run: `DEPLOY-DAY1.sql` in SQL Editor

### User Roles Still 3?
Re-run migration: `20251016145126_extend_user_roles_for_operators.sql`

### Functions Missing?
Re-run all 6 migration files individually

### Need Help?
Check: `VERIFICATION-GUIDE.md` for detailed troubleshooting

---

## ✅ Next Steps After Verification

**Once all checks pass:**

1. ✅ Mark Day 1 as Complete
2. ✅ Proceed with documentation updates (Option 1 of your plan)
3. ✅ Update PRD, Architecture docs, UX/UI specs
4. ✅ Generate stories for remaining epics

**Your requested plan:**
- Update architecture docs ✅
- Update PRD ✅
- Update UX/UI Doc ✅
- Create stories from sprint-change-proposal ✅

---

## 📊 Verification Status

- [ ] Quick verification completed (30 seconds)
- [ ] All 6 components passing ✅
- [ ] No ❌ failures detected
- [ ] Ready to proceed with Option 1: Documentation Updates

---

**Estimated Time:** 30 seconds to 1 minute  
**Risk:** None (read-only queries)  
**Ready to run:** Yes ✅
