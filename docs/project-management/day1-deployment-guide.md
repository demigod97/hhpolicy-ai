# Day 1 Deployment Guide - Backend Foundation

**Date:** October 16, 2025  
**Sprint:** 2-Week MVP Implementation  
**Phase:** Day 1 - Backend Foundation & Database Schema  

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase project: `vnmsyofypuhxjlzwnuhh` accessible
- [ ] Database password ready
- [ ] Backup current database (optional but recommended)
- [ ] SQL Editor access in Supabase Dashboard

---

## 🎯 Deployment Overview

### What This Deploys

**6 Database Migrations** covering:
1. ✅ **Role Extensions** - Add `company_operator` and `system_owner` roles
2. ✅ **API Keys Table** - Store encrypted provider API keys (OpenAI, Gemini, Mistral, Anthropic)
3. ✅ **Token Usage Tracking** - Track requests, tokens, costs, performance
4. ✅ **User Limits Table** - Daily/monthly token limits and rate limiting
5. ✅ **Native Chat Sessions** - Replace n8n with native chat storage
6. ✅ **PDF Storage Enhancement** - Add PDF storage columns to sources table

### Migration Files (In Order)

```
supabase/migrations/
├── 20251016145126_extend_user_roles_for_operators.sql
├── 20251016145127_create_api_keys_table.sql
├── 20251016145128_create_token_usage_tracking.sql
├── 20251016145129_create_user_limits_table.sql
├── 20251016145130_create_native_chat_sessions.sql
└── 20251016145131_enhance_sources_for_pdf_storage.sql
```

---

## 🚀 Deployment Methods

### Method 1: Supabase Dashboard (Recommended)

**Step 1: Open SQL Editor**
1. Go to: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql
2. Click "New Query"

**Step 2: Execute Each Migration**

Copy and paste each migration file content into the SQL Editor in order:

#### Migration 1: Extend User Roles
```sql
-- File: 20251016145126_extend_user_roles_for_operators.sql
-- Purpose: Add company_operator and system_owner roles (5 roles total)
-- Run this first!
```

**Actions:**
- Extends `user_roles.role` check constraint to include 5 roles
- Updates `policy_documents.role_assignment` constraint
- Updates `sources.target_role` constraint
- Creates indexes for new roles
- Adds RLS policies for new roles
- **Expected Result:** No errors, constraints updated

---

#### Migration 2: API Keys Table
```sql
-- File: 20251016145127_create_api_keys_table.sql
-- Purpose: Store encrypted API keys for OpenAI, Gemini, Mistral, Anthropic
```

**Creates:**
- `public.api_keys` table with AES-256 encryption support
- Columns: `encrypted_key`, `key_hash`, `provider`, `is_active`, `is_default`
- RLS policies for user-owned keys
- Helper functions: `update_api_key_updated_at()`, `verify_single_default_key()`
- Trigger for `updated_at` timestamp
- **Expected Result:** Table created with 8 indexes and 4 policies

---

#### Migration 3: Token Usage Tracking
```sql
-- File: 20251016145128_create_token_usage_tracking.sql
-- Purpose: Track token consumption, requests, costs, performance
```

**Creates:**
- `public.token_usage` table with comprehensive metrics
- Columns: `prompt_tokens`, `completion_tokens`, `model_used`, `provider`, `duration_ms`, `estimated_cost_usd`
- RLS policies for user data access
- Helper function: `calculate_token_cost()`
- Indexes for analytics queries (user_id, session_id, provider, timestamp)
- **Expected Result:** Table created with 7 indexes and 3 policies

---

#### Migration 4: User Limits Table
```sql
-- File: 20251016145129_create_user_limits_table.sql
-- Purpose: Daily/monthly token limits and rate limiting
```

**Creates:**
- `public.user_limits` table with quota management
- Columns: `daily_tokens`, `monthly_tokens`, `current_daily_tokens`, `current_monthly_tokens`, `last_reset_date`
- Helper functions: `check_user_token_limit()`, `increment_user_token_usage()`, `reset_daily_limits()`
- Scheduled job: `reset_daily_limits_job` (runs at midnight UTC)
- RLS policies for users and administrators
- **Expected Result:** Table created with 1 index, 5 policies, 3 functions, 1 cron job

---

#### Migration 5: Native Chat Sessions
```sql
-- File: 20251016145130_create_native_chat_sessions.sql
-- Purpose: Replace n8n with native Supabase chat storage
```

**Creates:**
- `public.chat_sessions` table for conversation storage
- `public.chat_messages` table for individual messages
- Columns: `session_metadata` (JSONB), `message_role` (user/assistant/system), `message_content`, `token_usage_id` (link to token tracking)
- RLS policies for user access
- Helper functions: `create_chat_session()`, `add_chat_message()`
- Indexes for session retrieval
- **Expected Result:** 2 tables created with 4 indexes and 6 policies

---

#### Migration 6: PDF Storage Enhancement
```sql
-- File: 20251016145131_enhance_sources_for_pdf_storage.sql
-- Purpose: Add PDF storage columns to sources table
```

**Creates:**
- New columns in `public.sources`:
  - `pdf_storage_path` (TEXT) - Supabase Storage path
  - `pdf_url` (TEXT) - Public/signed URL
  - `pdf_metadata` (JSONB) - File metadata
- Helper function: `update_source_updated_at()`
- Index on `pdf_storage_path`
- **Expected Result:** 3 columns added, 1 trigger, 1 index

---

### Method 2: Supabase CLI (Alternative)

If you have migrations synced properly:

```powershell
# From project root
supabase db push --linked

# Or manually repair and push
supabase migration repair --status reverted 20251008160503 20251008160636
supabase db push --linked
```

**Note:** This method had sync issues. Use Method 1 (Dashboard) if problems occur.

---

## ✅ Post-Deployment Verification

### Step 1: Verify Tables Created

```sql
-- Check all 4 new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')
ORDER BY table_name;

-- Expected result: 5 rows
```

### Step 2: Verify Role Extensions

```sql
-- Check user_roles constraint allows 5 roles
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'user_roles_role_check';

-- Expected result: Should include 'company_operator' and 'system_owner'
```

### Step 3: Verify PDF Columns Added

```sql
-- Check sources table has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'sources' 
AND column_name IN ('pdf_storage_path', 'pdf_url', 'pdf_metadata');

-- Expected result: 3 rows
```

### Step 4: Verify RLS Policies

```sql
-- Count RLS policies created
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages', 'user_roles', 'sources')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Expected: Multiple policies per table
```

### Step 5: Verify Helper Functions

```sql
-- Check helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
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
ORDER BY routine_name;

-- Expected result: 9 functions
```

### Step 6: Verify Cron Job

```sql
-- Check scheduled job exists
SELECT jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'reset_daily_limits_job';

-- Expected result: 1 row with schedule '0 0 * * *'
```

---

## 📊 What Got Created

### Tables Summary

| Table | Columns | Indexes | Policies | Purpose |
|-------|---------|---------|----------|---------|
| `api_keys` | 14 | 8 | 4 | Store encrypted API keys |
| `token_usage` | 21 | 7 | 3 | Track token consumption |
| `user_limits` | 12 | 1 | 5 | Manage user quotas |
| `chat_sessions` | 7 | 2 | 3 | Store chat conversations |
| `chat_messages` | 10 | 2 | 3 | Store individual messages |

### Schema Updates

| Table | Change | Details |
|-------|--------|---------|
| `user_roles` | Constraint | Now allows 5 roles (added company_operator, system_owner) |
| `policy_documents` | Constraint | Updated role_assignment to include new roles |
| `sources` | Columns | Added `pdf_storage_path`, `pdf_url`, `pdf_metadata` |
| `sources` | Constraint | Updated target_role to include new roles |

### Functions Added (9 total)

1. `update_api_key_updated_at()` - Auto-update timestamp
2. `verify_single_default_key()` - Ensure only 1 default key per provider
3. `calculate_token_cost()` - Calculate estimated costs
4. `check_user_token_limit()` - Verify user has quota
5. `increment_user_token_usage()` - Track token consumption
6. `reset_daily_limits()` - Reset daily counters
7. `create_chat_session()` - Helper to create sessions
8. `add_chat_message()` - Helper to add messages
9. `update_source_updated_at()` - Auto-update timestamp

### Scheduled Jobs (1 total)

1. `reset_daily_limits_job` - Runs daily at midnight UTC to reset `current_daily_tokens`

---

## 🔐 Security Features Implemented

### Row Level Security (RLS)

All tables have RLS enabled with granular policies:

**API Keys:**
- Users can only see/manage their own keys
- Administrators can view all keys for support

**Token Usage:**
- Users can only see their own usage data
- Administrators can see all usage for analytics

**User Limits:**
- Users can view their own limits
- Only administrators can modify limits
- System enforces limits via `check_user_token_limit()`

**Chat Sessions/Messages:**
- Users can only access their own conversations
- Administrators can view all chats for support

**User Roles:**
- New RLS policies for company_operator and system_owner
- Hierarchical access control (system_owner > company_operator > board > administrator > executive)

### Encryption

**API Keys:**
- Stored with AES-256 encryption in `encrypted_key` column
- SHA-256 hash in `key_hash` for verification
- Encryption key stored in environment variable (not in database)
- Decryption only happens server-side in Edge Functions

---

## 🧪 Test Data (Optional)

### Create Test API Key

```sql
-- Insert test API key (will be encrypted in production)
INSERT INTO public.api_keys (
  user_id,
  provider,
  key_name,
  encrypted_key,
  key_hash,
  is_active,
  is_default
) VALUES (
  auth.uid(), -- Replace with actual user UUID
  'openai',
  'Test OpenAI Key',
  'ENCRYPTED_KEY_PLACEHOLDER', -- In production, encrypt this
  encode(digest('test_key', 'sha256'), 'hex'),
  true,
  true
);
```

### Create Test User Limits

```sql
-- Set default limits for current user
INSERT INTO public.user_limits (
  user_id,
  daily_tokens,
  monthly_tokens,
  requests_per_minute
) VALUES (
  auth.uid(), -- Replace with actual user UUID
  10000,
  100000,
  10
);
```

### Create Test Chat Session

```sql
-- Create a test chat session
SELECT create_chat_session(
  auth.uid(), -- Replace with actual user UUID
  'test-notebook-uuid', -- Replace with actual notebook UUID
  '{"test": true}'::jsonb
);
```

---

## ⚠️ Known Issues & Fixes

### Issue 1: Migration Sync Errors

**Problem:** `supabase db push` fails with "Remote migration versions not found"

**Solution:** Use Dashboard SQL Editor (Method 1) or repair migration history:
```powershell
supabase migration repair --status reverted 20251008160503 20251008160636
```

### Issue 2: Constraint Already Exists

**Problem:** Error "constraint already exists" when running migrations

**Solution:** Migrations use `IF EXISTS` and `IF NOT EXISTS` clauses to handle this gracefully. If error persists, manually drop constraint first:
```sql
ALTER TABLE public.sources DROP CONSTRAINT IF EXISTS sources_policy_document_id_fkey;
```

### Issue 3: RLS Policy Conflicts

**Problem:** Policy name already exists

**Solution:** Drop existing policy first:
```sql
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
```

---

## 📈 Next Steps After Day 1

Once all migrations are applied:

1. ✅ **Day 2-3: Backend API Development**
   - Create Supabase Edge Functions for:
     - API key management
     - Token usage tracking
     - Chat session management
     - PDF upload handling

2. ✅ **Day 4-5: Frontend Components**
   - Build API key management UI
   - Build token usage dashboard
   - Build chat interface (replacing n8n)

3. ✅ **Day 6-7: AG-UI + CopilotKit Integration**
   - Install packages (@ag-ui/core, @copilotkit/react-core)
   - Set up providers and hooks
   - Connect to chat Edge Functions

4. ✅ **Day 8-9: Testing & Integration**
   - Test all 5 roles
   - Test token limits
   - Test chat functionality
   - Test PDF uploads

5. ✅ **Day 10: Deployment & Handoff**
   - Production deployment
   - Documentation
   - Team training

---

## 🎯 Success Criteria

Day 1 is complete when:

- [ ] All 6 migration files executed successfully
- [ ] All tables created (`api_keys`, `token_usage`, `user_limits`, `chat_sessions`, `chat_messages`)
- [ ] All columns added to `sources` table
- [ ] All 9 helper functions created
- [ ] All RLS policies active
- [ ] Cron job scheduled
- [ ] All verification queries pass
- [ ] No errors in database logs

---

## 📞 Support

**Issues?** Check:
1. Supabase Dashboard → Database → Logs
2. SQL Editor → Run verification queries
3. Migration files in `supabase/migrations/`

**Need Help?**
- Supabase Discord: https://discord.supabase.com
- Project Dashboard: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh

---

**Status:** Ready for Deployment  
**Estimated Time:** 15-30 minutes  
**Risk Level:** Low (all migrations use IF EXISTS clauses)
