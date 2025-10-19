# Manual Migration Steps - Epic 1.14

## Problem
The Supabase CLI wants to re-apply old migrations that are already in the database, causing conflicts.

## Solution: Apply Only Our New Migration Directly

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql/new

### Step 2: Copy and Run This SQL

```sql
-- ============================================================================
-- Migration: Fix chat_sessions table to reference notebooks
-- Epic 1.14: Document & Chat Architecture Restructure
-- Date: 2025-10-19
-- ============================================================================

DO $$
BEGIN
  -- Check if migration already applied
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_sessions_notebook_id_fkey'
    AND table_name = 'chat_sessions'
  ) THEN

    -- Step 1: Drop the existing foreign key constraint (if exists)
    EXECUTE 'ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_notebook_id_fkey';

    -- Step 2: Add correct foreign key constraint to notebooks table
    EXECUTE 'ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_notebook_id_fkey FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE SET NULL';

    -- Step 3: Create index
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_notebook_id
      ON public.chat_sessions(notebook_id)
      WHERE notebook_id IS NOT NULL;

    -- Step 4: Add comments
    EXECUTE 'COMMENT ON COLUMN public.chat_sessions.notebook_id IS ''Optional reference to the notebook (policy document collection) this chat session is about. NULL for general chats.''';

    RAISE NOTICE 'SUCCESS: Migration applied successfully';
  ELSE
    RAISE NOTICE 'SKIPPED: Migration already applied';
  END IF;
END $$;

-- Verify the fix
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
WHERE tc.table_name = 'chat_sessions'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'notebook_id';
```

### Step 3: Verify Results

You should see:
- **Notice**: "SUCCESS: Migration applied successfully" OR "SKIPPED: Migration already applied"
- **Query Result**: Should show the FK constraint pointing to `notebooks` table

Expected result:
```
constraint_name: chat_sessions_notebook_id_fkey
table_name: chat_sessions
column_name: notebook_id
foreign_table_name: notebooks
foreign_column_name: id
```

### Step 4: Record Migration

After successfully applying the migration, run this to record it in the migration history:

```sql
INSERT INTO supabase_migrations.schema_migrations (version)
VALUES ('20251019000000')
ON CONFLICT (version) DO NOTHING;
```

---

## ✅ Success Criteria

- [x] FK constraint `chat_sessions_notebook_id_fkey` exists
- [x] Constraint references `notebooks` table (not `policy_documents`)
- [x] Index `idx_chat_sessions_notebook_id` exists
- [x] No errors in SQL editor
- [x] Migration recorded in `schema_migrations` table

---

## Alternative: Skip All Old Migrations

If you want to use the CLI and skip old migrations:

```bash
# This will mark all old migrations as applied without running them
npx supabase db push --exclude "2025011*,2025012*,2025060*,2025091*,2025092*,2025101*" -p "Coral@123"
```

But the SQL Editor approach above is **simpler and safer**.

---

**Estimated Time**: 2 minutes
**Risk**: Very Low (idempotent, safe to re-run)
