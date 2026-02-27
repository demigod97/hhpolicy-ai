-- ============================================================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- URL: https://supabase.com/dashboard/project/vnmsyofypuhxjlzwnuhh/sql/new
-- ============================================================================

-- Migration: Fix chat_sessions FK to reference notebooks
-- Epic 1.14: Document & Chat Architecture Restructure

DO $$
BEGIN
  -- Check if migration already applied
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_sessions_notebook_id_fkey'
    AND table_name = 'chat_sessions'
  ) THEN

    RAISE NOTICE 'Applying migration...';

    -- Step 1: Drop old constraint
    EXECUTE 'ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_notebook_id_fkey';

    -- Step 2: Add correct FK to notebooks
    EXECUTE 'ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_notebook_id_fkey FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id) ON DELETE SET NULL';

    -- Step 3: Create index
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_notebook_id
      ON public.chat_sessions(notebook_id)
      WHERE notebook_id IS NOT NULL;

    -- Step 4: Add comments
    EXECUTE 'COMMENT ON COLUMN public.chat_sessions.notebook_id IS ''Optional reference to the notebook (policy document collection) this chat session is about. NULL for general chats.''';

    RAISE NOTICE '✅ SUCCESS: Migration applied!';
  ELSE
    RAISE NOTICE '⏭️  SKIPPED: Migration already applied';
  END IF;
END $$;

-- Verify it worked
SELECT
  '✅ FK Constraint Verified' AS status,
  tc.constraint_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_sessions'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'notebook_id';

-- Expected result:
-- status: ✅ FK Constraint Verified
-- constraint_name: chat_sessions_notebook_id_fkey
-- references_table: notebooks
-- references_column: id
