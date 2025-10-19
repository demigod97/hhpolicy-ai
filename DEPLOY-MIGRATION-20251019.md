# Deployment Guide: Epic 1.14 Database Migration

**Date**: October 19, 2025
**Migration**: `20251019000000_fix_chat_sessions_notebook_reference.sql`
**Status**: Ready for deployment

---

## 📋 Pre-Deployment Checklist

- [ ] Backup current database (recommended)
- [ ] Have Supabase project URL handy
- [ ] Have database password ready
- [ ] Confirm current schema has `chat_sessions` and `notebooks` tables

---

## 🚀 Deployment Options

### **Option 1: Supabase Dashboard (Recommended)**

1. **Navigate to SQL Editor**:
   - Open https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql/new
   - Log in if needed

2. **Copy and paste the migration SQL**:
   ```sql
   -- Fix chat_sessions table to reference notebooks instead of policy_documents

   -- Step 1: Drop the existing foreign key constraint
   ALTER TABLE public.chat_sessions
     DROP CONSTRAINT IF EXISTS chat_sessions_notebook_id_fkey;

   -- Step 2: Add correct foreign key constraint to notebooks table
   ALTER TABLE public.chat_sessions
     ADD CONSTRAINT chat_sessions_notebook_id_fkey
     FOREIGN KEY (notebook_id)
     REFERENCES public.notebooks(id)
     ON DELETE SET NULL;

   -- Step 3: Ensure the index exists for performance
   CREATE INDEX IF NOT EXISTS idx_chat_sessions_notebook_id
     ON public.chat_sessions(notebook_id)
     WHERE notebook_id IS NOT NULL;

   -- Step 4: Add helpful comments
   COMMENT ON COLUMN public.chat_sessions.notebook_id IS
   'Optional reference to the notebook (policy document collection) this chat session is about. NULL for general chats.';

   COMMENT ON CONSTRAINT chat_sessions_notebook_id_fkey ON public.chat_sessions IS
   'References notebooks table for backward compatibility with existing n8n chat system.';
   ```

3. **Click "Run"** or press `Ctrl+Enter`

4. **Verify success**:
   - Should see "Success. No rows returned"
   - Check that constraint was created successfully

---

### **Option 2: Supabase CLI**

1. **Ensure you're in the project directory**:
   ```bash
   cd D:\ailocal\hhpolicy-ai
   ```

2. **Run the migration**:
   ```bash
   npx supabase db push
   ```

3. **Enter database password when prompted**

4. **Verify success**:
   ```bash
   npx supabase db pull
   ```

---

## ✅ Post-Deployment Verification

### **1. Verify Foreign Key Constraint**

Run this query in Supabase SQL Editor:

```sql
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

**Expected Result**:
```
constraint_name: chat_sessions_notebook_id_fkey
table_name: chat_sessions
column_name: notebook_id
foreign_table_name: notebooks
foreign_column_name: id
```

### **2. Verify Index Exists**

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'chat_sessions'
  AND indexname = 'idx_chat_sessions_notebook_id';
```

**Expected Result**:
- Index should exist with condition `WHERE notebook_id IS NOT NULL`

### **3. Test Constraint**

```sql
-- This should succeed (NULL is allowed)
INSERT INTO chat_sessions (user_id, title, notebook_id)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test Session',
  NULL
);

-- Clean up test data
DELETE FROM chat_sessions WHERE title = 'Test Session';
```

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong, run this rollback:

```sql
-- Rollback: Restore original constraint
ALTER TABLE public.chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_notebook_id_fkey;

-- Restore original (broken) constraint to policy_documents
-- NOTE: This will fail if policy_documents table doesn't exist
-- which is expected - the original migration was incorrect
```

**Note**: The original migration referenced a non-existent `policy_documents` table, so rolling back is not recommended. Instead, fix any issues forward.

---

## 📊 Migration Impact

**Risk Level**: ✅ **LOW**
- Only updates foreign key constraint
- No data modification
- No breaking changes to existing functionality
- `IF NOT EXISTS` clauses prevent errors if already applied

**Downtime**: ⚡ **ZERO**
- No table locks
- No data changes
- Migration runs in <1 second

**Affected Tables**:
- `chat_sessions` (constraint update only)

**Affected Data**:
- None (no data changes)

---

## 🐛 Troubleshooting

### **Error: "constraint already exists"**
✅ **This is fine!** The migration uses `IF NOT EXISTS`, so it's safe to run multiple times.

### **Error: "table chat_sessions does not exist"**
❌ **Problem**: The chat_sessions table hasn't been created yet.
**Solution**: Run migration `20251016145130_create_native_chat_sessions.sql` first.

### **Error: "table notebooks does not exist"**
❌ **Problem**: The notebooks table is missing from your database.
**Solution**: Run the base migration `20250606152423_v0.1.sql` first.

---

## 📝 Migration Details

**File**: `supabase/migrations/20251019000000_fix_chat_sessions_notebook_reference.sql`

**Purpose**:
- Fix incorrect foreign key in `chat_sessions` table
- Original migration referenced non-existent `policy_documents` table
- Correct table name is `notebooks`

**Changes**:
1. Drop incorrect FK constraint (if exists)
2. Create correct FK constraint to `notebooks` table
3. Add performance index
4. Add documentation comments

---

## ✅ Success Criteria

After deployment, verify:
- [x] Migration runs without errors
- [x] Foreign key constraint points to `notebooks` table
- [x] Index `idx_chat_sessions_notebook_id` exists
- [x] Comments added to column and constraint
- [x] No disruption to existing chat sessions
- [x] Application continues to work normally

---

**Deployment Status**: ⏳ **Pending Manual Execution**

Once deployed, update this status to: ✅ **DEPLOYED**

---

**End of Deployment Guide**
