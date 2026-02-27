# 🔍 Day 1 Deployment Verification Guide

**Date:** October 16, 2025  
**Purpose:** Verify all Day 1 database migrations deployed successfully  
**Project:** PolicyAi - vnmsyofypuhxjlzwnuhh

---

## ⚡ Quick Verification (30 seconds)

**Step 1:** Open Supabase SQL Editor
```
https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
```

**Step 2:** Copy and paste `QUICK-VERIFY.sql` contents

**Step 3:** Click Run and check results:

### Expected Output:

| Component | Status |
|-----------|--------|
| Tables | 5 created (expected: 5) ✅ |
| Functions | 9 created (expected: 9) ✅ |
| User Roles | Extended to 5 roles ✅ |
| PDF Columns | 3 added to sources (expected: 3) ✅ |
| Cron Jobs | 1 scheduled (expected: 1) ✅ |
| RLS Policies | 23+ created (expected: 23+) ✅ |

---

## 🔬 Comprehensive Verification (5 minutes)

Use `VERIFY-DAY1-DEPLOYMENT.sql` for detailed checks.

### What It Verifies:

**1. New Tables (5 total)**
- ✅ `api_keys` - Encrypted API key storage
- ✅ `token_usage` - Token tracking with cost estimation
- ✅ `user_limits` - Daily/monthly quotas
- ✅ `chat_sessions` - Native chat sessions
- ✅ `chat_messages` - Chat message history

**2. User Roles Constraint**
- ✅ Updated from 3 roles to 5 roles
- ✅ Added: `company_operator`, `system_owner`

**3. PDF Storage Columns**
- ✅ `sources.pdf_storage_path`
- ✅ `sources.pdf_url`
- ✅ `sources.pdf_metadata`

**4. Helper Functions (9 total)**
- ✅ `update_api_key_updated_at()` - Trigger function
- ✅ `verify_single_default_key()` - Validation trigger
- ✅ `calculate_token_cost()` - Cost calculation
- ✅ `check_user_token_limit()` - Limit validation
- ✅ `increment_user_token_usage()` - Usage tracking
- ✅ `reset_daily_limits()` - Daily reset function
- ✅ `create_chat_session()` - Session creation helper
- ✅ `add_chat_message()` - Message creation helper
- ✅ `update_source_updated_at()` - Trigger function

**5. Scheduled Cron Job**
- ✅ `reset_daily_limits_job` - Runs at 00:00 UTC daily

**6. RLS Policies (23+ total)**
- ✅ `api_keys` - 4 policies
- ✅ `token_usage` - 3 policies
- ✅ `user_limits` - 5 policies
- ✅ `chat_sessions` - 4 policies
- ✅ `chat_messages` - 2 policies
- ✅ `user_roles` - Updated policies for 5 roles
- ✅ `policy_documents` - Updated constraints
- ✅ `sources` - Updated policies

**7. Table Structures**
- Full column validation for each table
- Data types verification
- Nullable constraints
- Default values

**8. Indexes**
- Primary keys
- Foreign key indexes
- Performance indexes (role filters, user lookups)

**9. Foreign Key Relationships**
- All tables properly linked to `auth.users`
- Referential integrity enforced

**10. RLS Status**
- RLS enabled on all 5 new tables

**11. Storage Buckets**
- `policy_documents` bucket configuration

**12. Summary Checklist**
- Automated pass/fail for all components

---

## 🎯 Verification Methods

### Method 1: SQL Editor (Recommended)

**Steps:**
1. Open SQL Editor
2. Paste verification SQL
3. Execute and review results
4. Verify all ✅ checkmarks

**Files:**
- `QUICK-VERIFY.sql` - Fast overview
- `VERIFY-DAY1-DEPLOYMENT.sql` - Detailed analysis

---

### Method 2: Supabase Dashboard (Visual)

#### Check Tables:
1. Go to: Database → Tables
2. Verify 5 new tables exist:
   - `api_keys`
   - `token_usage`
   - `user_limits`
   - `chat_sessions`
   - `chat_messages`

#### Check Policies:
1. Go to: Authentication → Policies
2. Filter by table name
3. Count policies per table (should match expected counts)

#### Check Cron Jobs:
1. Go to: Database → Cron Jobs
2. Verify `reset_daily_limits_job` exists
3. Check schedule: `0 0 * * *` (midnight UTC)

#### Check Functions:
1. Go to: Database → Functions
2. Verify 9 helper functions exist

---

### Method 3: Supabase CLI (Developer)

#### Pull Remote Schema:
```powershell
supabase db pull --schema public
```

This will show you the remote schema state.

#### Check Migration Status:
```powershell
supabase migration list --linked
```

This shows which migrations are applied remotely.

---

## 📊 Expected Schema Summary

### Tables Created: 5

| Table | Columns | Indexes | Policies | Purpose |
|-------|---------|---------|----------|---------|
| api_keys | 11 | 8 | 4 | Encrypted API key storage |
| token_usage | 11 | 7 | 3 | Token usage tracking |
| user_limits | 9 | 5 | 5 | User quotas and limits |
| chat_sessions | 8 | 4 | 4 | Native chat sessions |
| chat_messages | 8 | 4 | 2 | Chat message history |

### Tables Modified: 3

| Table | Modification | Impact |
|-------|--------------|--------|
| user_roles | Constraint updated | Now supports 5 roles |
| policy_documents | Constraint updated | Role assignment for 5 roles |
| sources | 3 columns added | PDF storage support |

### Functions Added: 9

| Function | Type | Purpose |
|----------|------|---------|
| update_api_key_updated_at | Trigger | Update timestamp |
| verify_single_default_key | Trigger | Enforce single default |
| calculate_token_cost | Helper | Calculate usage cost |
| check_user_token_limit | Helper | Validate limits |
| increment_user_token_usage | Helper | Track usage |
| reset_daily_limits | Helper | Daily reset |
| create_chat_session | Helper | Session creation |
| add_chat_message | Helper | Message creation |
| update_source_updated_at | Trigger | Update timestamp |

### Cron Jobs: 1

| Job Name | Schedule | Command | Purpose |
|----------|----------|---------|---------|
| reset_daily_limits_job | 0 0 * * * | SELECT public.reset_daily_limits() | Reset daily token limits |

---

## 🚨 Troubleshooting

### Issue: Tables Not Found

**Check:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Solution:** If tables missing, re-run `DEPLOY-DAY1.sql`

---

### Issue: User Roles Still Shows 3 Roles

**Check:**
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'user_roles_role_check';
```

**Solution:** If clause doesn't include `company_operator` and `system_owner`, run migration 20251016145126 again

---

### Issue: Functions Not Found

**Check:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

**Solution:** Re-run migrations that create functions (127, 128, 129, 130, 131)

---

### Issue: RLS Policies Missing

**Check:**
```sql
SELECT tablename, COUNT(*) 
FROM pg_policies 
WHERE tablename IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
GROUP BY tablename;
```

**Solution:** Re-run all migrations (RLS policies created with tables)

---

### Issue: Cron Job Not Scheduled

**Check:**
```sql
SELECT * FROM cron.job WHERE jobname = 'reset_daily_limits_job';
```

**Solution:** Re-run migration 20251016145129 (user_limits with cron job)

---

## ✅ Verification Checklist

Run through this checklist to confirm deployment success:

### Database Objects:
- [ ] 5 new tables exist (`api_keys`, `token_usage`, `user_limits`, `chat_sessions`, `chat_messages`)
- [ ] `user_roles` constraint updated to 5 roles
- [ ] `sources` table has 3 new PDF columns
- [ ] 9 helper functions created
- [ ] 1 cron job scheduled
- [ ] 23+ RLS policies active

### Data Integrity:
- [ ] All foreign keys properly linked to `auth.users`
- [ ] All tables have RLS enabled
- [ ] All indexes created for performance
- [ ] All triggers attached to correct tables

### Security:
- [ ] RLS policies enforce role-based access
- [ ] API keys use encrypted storage
- [ ] Token usage tracks all metrics
- [ ] User limits enforced

### Functionality:
- [ ] Can query all 5 new tables without errors
- [ ] Can call all 9 helper functions
- [ ] Cron job scheduled correctly
- [ ] Triggers fire on insert/update

---

## 🎉 Success Criteria

**Day 1 deployment is successful when:**

1. ✅ Quick verification shows all 6 components passing
2. ✅ Comprehensive verification shows no ❌ failures
3. ✅ All 7 checklist items in verification summary pass
4. ✅ Dashboard shows 5 new tables in Table Editor
5. ✅ No errors in Database logs
6. ✅ Can insert test data into new tables

---

## 📝 Next Steps After Verification

**If All Checks Pass:**
1. ✅ Update project status: Day 1 Complete
2. ✅ Commit verification results
3. ✅ Begin Day 2-3: Edge Functions development
4. ✅ Review Day 2-3 requirements

**If Any Checks Fail:**
1. ⚠️ Identify failing component
2. ⚠️ Re-run specific migration file
3. ⚠️ Re-verify after fix
4. ⚠️ Document issue in troubleshooting log

---

## 📞 Support Resources

**Supabase Dashboard:**
- SQL Editor: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
- Table Editor: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/editor
- Database Logs: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/logs

**Documentation:**
- Day 1 Deployment Guide: `docs/project-management/day1-deployment-guide.md`
- Sprint Change Proposal: `docs/project-management/sprint-change-proposal.md`
- Database Schema: `docs/architecture/data-models-database-schema.md`

**Files Created:**
- `DEPLOY-DAY1.sql` - Full deployment script
- `QUICK-VERIFY.sql` - Fast verification query
- `VERIFY-DAY1-DEPLOYMENT.sql` - Comprehensive verification
- `DAY1-FINAL-STATUS.md` - Deployment ready status

---

**Verification Status:** Ready to Run  
**Estimated Time:** 30 seconds (quick) to 5 minutes (comprehensive)  
**Risk:** None - read-only queries
