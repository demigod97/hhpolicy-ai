# Migration Failure Analysis and Fixes

**Date:** October 16, 2025  
**Status:** 3 Critical Issues Identified

---

## Issue Summary

### 1. DEPLOY-DAY1-FIXED.sql Syntax Error (Line 701)
**Error:** `ERROR: 42601: syntax error at or near "SELECT"`

**Root Cause:** 
Incorrect quoting in `cron.schedule()` function call:
```sql
$$SELECT reset_daily_limits()$$  -- WRONG: Double dollar quotes conflict
```

**Fix:** Use proper SQL string quoting:
```sql
$cron$SELECT reset_daily_limits()$cron$  -- CORRECT: Named dollar quotes
```

---

### 2. notebooks Table Not Found
**Error:** `ERROR: 42P01: relation "public.notebooks" does not exist`

**Root Cause:**
- Migration `20250117000001_rename_notebooks_to_policy_documents.sql` renamed `notebooks` → `policy_documents`
- New Day 1 migrations (token_usage, chat_sessions) still reference `notebooks`
- Migration order conflict

**Affected Files:**
- `20251016145128_create_token_usage_tracking.sql` (line references notebook_id FK)
- `20251016145130_create_native_chat_sessions.sql` (line 16: REFERENCES public.notebooks)

**Fix:** Replace all `notebooks` references with `policy_documents` in new migrations

---

### 3. Invalid source_type Enum Value 'file'
**Error:** `ERROR: 22P02: invalid input value for enum source_type: "file"`

**Root Cause:**
- Enum `source_type` defined as: `('pdf', 'text', 'website', 'youtube', 'audio')`
- Migration `20251016145131_enhance_sources_for_pdf_storage.sql` uses `WHERE type = 'file'`
- Value `'file'` does NOT exist in enum

**Fix:** Change `type = 'file'` to `type = 'pdf'` (correct enum value)

---

## Fix Priority Order

### Step 1: Fix DEPLOY-DAY1-FIXED.sql
Replace the cron schedule syntax error

### Step 2: Fix Individual Migration Files
Update three migration files:
1. `20251016145128_create_token_usage_tracking.sql` - notebooks → policy_documents
2. `20251016145130_create_native_chat_sessions.sql` - notebooks → policy_documents  
3. `20251016145131_enhance_sources_for_pdf_storage.sql` - 'file' → 'pdf'

### Step 3: Regenerate DEPLOY-DAY1-FIXED.sql
Consolidate all 6 corrected migrations into new deployment script

---

## Database State Verification Needed

Before applying fixes, verify:
- [ ] `policy_documents` table exists (renamed from notebooks)
- [ ] `source_type` enum values: `('pdf', 'text', 'website', 'youtube', 'audio')`
- [ ] Which Day 1 migrations succeeded (check applied_migrations)
- [ ] RLS policies on policy_documents table
- [ ] Existing foreign key constraints

---

## Rollback Strategy

If migrations partially applied:
1. Check `supabase_migrations.schema_migrations` for applied migrations
2. Roll back only failed migrations
3. Apply corrected versions
4. Verify data integrity
