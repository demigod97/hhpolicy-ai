# Migration Fixes Applied - Day 1 Deployment

**Date:** October 16, 2025  
**Status:** ✅ All 3 Issues Fixed

---

## Summary of Fixes

### ✅ Fix 1: DEPLOY-DAY1-FIXED.sql - Cron Schedule Syntax (Line 701)

**Original Error:**
```
ERROR: 42601: syntax error at or near "SELECT"
LINE 701: $$SELECT reset_daily_limits()$$
```

**Root Cause:** Dollar-quote delimiter conflict in `cron.schedule()` function

**Fix Applied:**
```sql
-- BEFORE (WRONG):
$$SELECT reset_daily_limits()$$

-- AFTER (CORRECT):
$cron$SELECT reset_daily_limits()$cron$
```

**Files Updated:**
- ✅ `DEPLOY-DAY1-FIXED.sql` (line 701)

---

### ✅ Fix 2: notebooks → policy_documents Reference

**Original Error:**
```
ERROR: 42P01: relation "public.notebooks" does not exist
```

**Root Cause:** 
- Migration `20250117000001_rename_notebooks_to_policy_documents.sql` renamed table
- New Day 1 migrations still referenced old `notebooks` table name
- Should reference `policy_documents` instead

**Fix Applied:**
```sql
-- BEFORE (WRONG):
notebook_id UUID REFERENCES public.notebooks(id)

-- AFTER (CORRECT):
notebook_id UUID REFERENCES public.policy_documents(id)
```

**Files Updated:**
- ✅ `20251016145128_create_token_usage_tracking.sql` (line 16)
- ✅ `20251016145130_create_native_chat_sessions.sql` (line 16)

**Note:** DEPLOY-DAY1-FIXED.sql did NOT have this issue (uses different structure)

---

### ✅ Fix 3: Invalid Enum Value 'file' → 'pdf'

**Original Error:**
```
ERROR: 22P02: invalid input value for enum source_type: "file"
LINE 23: WHERE type = 'file'
```

**Root Cause:**
- Enum `source_type` defined as: `('pdf', 'text', 'website', 'youtube', 'audio')`
- Migration used non-existent value `'file'`
- Correct value is `'pdf'`

**Fix Applied:**
```sql
-- BEFORE (WRONG):
WHERE type = 'file'

-- AFTER (CORRECT):
WHERE type = 'pdf'
```

**Files Updated:**
- ✅ `20251016145131_enhance_sources_for_pdf_storage.sql` (2 occurrences - lines 23, 125)
- ✅ `DEPLOY-DAY1-FIXED.sql` (2 occurrences - lines 1021, 1128)

---

## Deployment Instructions

### Option A: Deploy Fixed Consolidated Script (Recommended)

```bash
# 1. Open Supabase SQL Editor
# https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql

# 2. Copy entire contents of DEPLOY-DAY1-FIXED.sql

# 3. Paste and execute in SQL Editor

# 4. Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
ORDER BY table_name;
```

### Option B: Deploy Individual Migration Files

If some migrations already succeeded, deploy only the failed ones:

```bash
# Deploy fixed token_usage migration
psql -h [host] -U postgres -d postgres < supabase/migrations/20251016145128_create_token_usage_tracking.sql

# Deploy fixed chat_sessions migration
psql -h [host] -U postgres -d postgres < supabase/migrations/20251016145130_create_native_chat_sessions.sql

# Deploy fixed PDF storage migration
psql -h [host] -U postgres -d postgres < supabase/migrations/20251016145131_enhance_sources_for_pdf_storage.sql
```

### Option C: Use Supabase CLI

```bash
# Apply specific migrations
supabase db push

# Or reset and reapply all
supabase db reset
```

---

## Verification Queries

After deployment, run these to verify:

### 1. Check All Day 1 Tables Created

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'api_keys', 
    'token_usage', 
    'user_limits', 
    'chat_sessions', 
    'chat_messages',
    'policy_documents'  -- Verify renamed table
  )
ORDER BY table_name;
```

Expected result: 6 tables (or 5 if policy_documents already exists)

### 2. Verify Foreign Key References

```sql
-- Check token_usage references policy_documents (not notebooks)
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('token_usage', 'chat_sessions')
  AND ccu.table_name = 'policy_documents';
```

Expected result: 2 foreign keys (token_usage.notebook_id, chat_sessions.notebook_id)

### 3. Verify source_type Enum

```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'source_type'
)
ORDER BY enumlabel;
```

Expected result: audio, pdf, text, website, youtube (5 values, NO 'file')

### 4. Check Cron Job Scheduled

```sql
SELECT * 
FROM cron.job 
WHERE jobname = 'reset_daily_limits_job';
```

Expected result: 1 job scheduled for midnight UTC

---

## What's Next

After successful deployment:

1. ✅ All Day 1 database schema complete
2. ✅ Ready for Day 2: Edge Functions & API endpoints
3. ✅ Ready for Day 3: Frontend UI components

### Immediate Next Steps (Day 2)

Per #file:sprint-phasing-plan.md:

**Day 2: API Key Management Backend**
- Create Supabase Edge Function: `store_api_key`
- Create Supabase Edge Function: `retrieve_api_key`
- Create Supabase Edge Function: `test_api_key`
- Implement encryption/decryption utilities

---

## Files Modified

### Migration Files (Source)
1. ✅ `supabase/migrations/20251016145128_create_token_usage_tracking.sql`
2. ✅ `supabase/migrations/20251016145130_create_native_chat_sessions.sql`
3. ✅ `supabase/migrations/20251016145131_enhance_sources_for_pdf_storage.sql`

### Deployment Script (Consolidated)
4. ✅ `DEPLOY-DAY1-FIXED.sql`

### Documentation
5. ✅ `FIX-MIGRATION-ISSUES.md` (analysis)
6. ✅ `MIGRATION-FIXES-SUMMARY.md` (this file)

---

## Rollback Plan

If issues occur after deployment:

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.token_usage CASCADE;
DROP TABLE IF EXISTS public.user_limits CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Unschedule cron job
SELECT cron.unschedule('reset_daily_limits_job');

-- Remove added columns from sources
ALTER TABLE public.sources
DROP COLUMN IF EXISTS pdf_file_path,
DROP COLUMN IF EXISTS pdf_storage_bucket,
DROP COLUMN IF EXISTS pdf_file_size,
DROP COLUMN IF EXISTS pdf_page_count,
DROP COLUMN IF EXISTS pdf_metadata;

-- Revert role constraints (if needed)
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('administrator', 'executive', 'board'));
```

---

## Summary

**Status:** ✅ Ready for Deployment

All 3 critical issues have been identified and fixed:
1. ✅ Cron syntax error fixed
2. ✅ notebooks → policy_documents references updated
3. ✅ 'file' → 'pdf' enum value corrected

The corrected files are ready for immediate deployment via Supabase SQL Editor or CLI.
