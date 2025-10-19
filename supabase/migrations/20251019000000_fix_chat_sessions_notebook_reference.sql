-- ============================================================================
-- Migration: Fix chat_sessions table to reference notebooks instead of policy_documents
-- Epic 1.14: Document & Chat Architecture Restructure
-- Story 1.14.1: Database Schema - Chat Sessions Migration
-- Date: 2025-10-19
-- ============================================================================

-- IMPORTANT: This migration fixes the chat_sessions table created in migration
-- 20251016145130 which incorrectly referenced policy_documents instead of notebooks.
--
-- The notebooks table is the ACTUAL table name in our schema, not policy_documents.
-- We keep notebooks for backward compatibility with existing n8n chat system.

BEGIN;

-- Step 1: Drop the existing foreign key constraint on chat_sessions.notebook_id
-- (it references the non-existent policy_documents table)
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

-- Step 5: Verify the fix worked
DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_sessions_notebook_id_fkey'
    AND table_name = 'chat_sessions'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    RAISE NOTICE 'SUCCESS: chat_sessions.notebook_id now correctly references notebooks table';
  ELSE
    RAISE EXCEPTION 'ERROR: Foreign key constraint was not created successfully';
  END IF;
END $$;

COMMIT;
