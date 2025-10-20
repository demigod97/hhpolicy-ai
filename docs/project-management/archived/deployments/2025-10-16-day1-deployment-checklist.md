# Day 1 Migration Deployment Checklist

**Date:** October 16, 2025  
**Project:** PolicyAi (vnmsyofypuhxjlzwnuhh)  
**Branch:** HHR-120-login-role-hierarchy

---

## Pre-Deployment Verification

### 1. Check Current Database State

```sql
-- Verify policy_documents table exists (notebooks was renamed)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'policy_documents'
) as policy_documents_exists;

-- Verify source_type enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'source_type')
ORDER BY enumlabel;
-- Expected: audio, pdf, text, website, youtube (NOT 'file')

-- Check which migrations are already applied
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 20;
```

### 2. Backup Current State (Optional but Recommended)

```bash
# Backup via Supabase CLI
supabase db dump > backup-before-day1-$(date +%Y%m%d).sql

# Or via Dashboard: Database → Backups → Create Backup
```

---

## Deployment Steps

### Option A: Full Consolidated Deployment (Recommended if starting fresh)

**Use this if:** No Day 1 migrations have been successfully applied yet

```bash
# 1. Navigate to Supabase SQL Editor
# https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql

# 2. Open DEPLOY-DAY1-FIXED.sql in VS Code

# 3. Copy ENTIRE contents (Ctrl+A, Ctrl+C)

# 4. Paste into SQL Editor

# 5. Execute (Run button or F5)

# 6. Wait for "Success. No rows returned" message

# Expected execution time: 5-10 seconds
```

### Option B: Individual Migration Files (If some already succeeded)

**Use this if:** Some migrations succeeded, only deploy the failed ones

#### Failed Migration 1: Token Usage Tracking

```bash
# In Supabase SQL Editor, run:
```

```sql
-- Copy contents from:
-- supabase/migrations/20251016145128_create_token_usage_tracking.sql
-- (Already fixed: notebooks → policy_documents)
```

#### Failed Migration 2: Chat Sessions

```bash
# In Supabase SQL Editor, run:
```

```sql
-- Copy contents from:
-- supabase/migrations/20251016145130_create_native_chat_sessions.sql
-- (Already fixed: notebooks → policy_documents)
```

#### Failed Migration 3: PDF Storage Enhancement

```bash
# In Supabase SQL Editor, run:
```

```sql
-- Copy contents from:
-- supabase/migrations/20251016145131_enhance_sources_for_pdf_storage.sql
-- (Already fixed: 'file' → 'pdf')
```

---

## Post-Deployment Verification

### ✅ Step 1: Verify Tables Created

```sql
-- Should return 5 new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'api_keys',
    'token_usage', 
    'user_limits',
    'chat_sessions',
    'chat_messages'
  )
ORDER BY table_name;
```

**Expected Result:** 5 rows

### ✅ Step 2: Verify Foreign Keys

```sql
-- Check references to policy_documents (NOT notebooks)
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('token_usage', 'chat_sessions')
  AND ccu.table_name = 'policy_documents';
```

**Expected Result:** 2 rows (token_usage.notebook_id, chat_sessions.notebook_id)

### ✅ Step 3: Verify RLS Policies

```sql
-- Check new RLS policies created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
ORDER BY tablename, policyname;
```

**Expected Result:** ~15-20 policies across all tables

### ✅ Step 4: Verify Extended Roles

```sql
-- Check role constraint includes 5 roles
SELECT conname, consrc
FROM pg_constraint
WHERE conname = 'user_roles_role_check';
```

**Expected Result:** Contains 'company_operator' and 'system_owner'

### ✅ Step 5: Verify PDF Storage Columns

```sql
-- Check new columns added to sources table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sources'
  AND column_name LIKE 'pdf_%'
ORDER BY column_name;
```

**Expected Result:** 5 columns (pdf_file_path, pdf_storage_bucket, pdf_file_size, pdf_page_count, pdf_metadata)

### ✅ Step 6: Verify Cron Job (Optional, requires pg_cron extension)

```sql
-- Check if reset_daily_limits job is scheduled
SELECT jobname, schedule, command
FROM cron.job
WHERE jobname = 'reset_daily_limits_job';
```

**Expected Result:** 1 row with schedule '0 0 * * *'

---

## Troubleshooting

### Issue: "relation already exists"

**Cause:** Some migrations were partially applied

**Solution:**
1. Check which tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages');
   ```
2. Drop existing tables and re-run:
   ```sql
   DROP TABLE IF EXISTS chat_messages CASCADE;
   DROP TABLE IF EXISTS chat_sessions CASCADE;
   DROP TABLE IF EXISTS token_usage CASCADE;
   DROP TABLE IF EXISTS user_limits CASCADE;
   DROP TABLE IF EXISTS api_keys CASCADE;
   ```

### Issue: "column already exists"

**Cause:** PDF storage migration was partially applied

**Solution:**
```sql
-- Remove added columns
ALTER TABLE sources
DROP COLUMN IF EXISTS pdf_file_path,
DROP COLUMN IF EXISTS pdf_storage_bucket,
DROP COLUMN IF EXISTS pdf_file_size,
DROP COLUMN IF EXISTS pdf_page_count,
DROP COLUMN IF EXISTS pdf_metadata;

-- Then re-run the migration
```

### Issue: "constraint already exists"

**Cause:** Role extension was partially applied

**Solution:**
```sql
-- Drop and recreate constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
-- Then re-run the migration
```

---

## Success Criteria

All checks must pass:

- [ ] ✅ 5 new tables created (api_keys, token_usage, user_limits, chat_sessions, chat_messages)
- [ ] ✅ Foreign keys reference policy_documents (not notebooks)
- [ ] ✅ RLS policies active on all new tables
- [ ] ✅ user_roles constraint includes 5 roles
- [ ] ✅ sources table has 5 new PDF columns
- [ ] ✅ No "notebooks" references in database
- [ ] ✅ No 'file' enum values used (only 'pdf')
- [ ] ✅ Cron job scheduled (if pg_cron enabled)

---

## Next Steps After Success

### Immediate (Day 2)

Per sprint-phasing-plan.md:

**Day 2: API Key Management Backend**
1. Install crypto-js library
2. Create Supabase Edge Functions:
   - `store_api_key` (encryption + storage)
   - `retrieve_api_key` (decryption + retrieval)
   - `test_api_key` (validation)
3. Test encryption/decryption cycle

### Week 2 (Days 6-10)

**AG-UI + CopilotKit Integration:**
- Install @copilotkit/react-core, @ag-ui/react
- Build chat interface components
- PDF viewer integration
- Admin dashboards

---

## Rollback Instructions

If critical issues occur after deployment:

```sql
-- Execute in this order:
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.token_usage CASCADE;
DROP TABLE IF EXISTS public.user_limits CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Remove PDF columns
ALTER TABLE public.sources
DROP COLUMN IF EXISTS pdf_file_path,
DROP COLUMN IF EXISTS pdf_storage_bucket,
DROP COLUMN IF EXISTS pdf_file_size,
DROP COLUMN IF EXISTS pdf_page_count,
DROP COLUMN IF EXISTS pdf_metadata;

-- Revert roles (if needed)
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_role_check;
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('administrator', 'executive', 'board'));

-- Unschedule cron
SELECT cron.unschedule('reset_daily_limits_job');
```

---

## Contact & Support

- **Project Lead:** [Your Name]
- **Supabase Project:** vnmsyofypuhxjlzwnuhh
- **Documentation:** See MIGRATION-FIXES-SUMMARY.md for detailed fix explanations
