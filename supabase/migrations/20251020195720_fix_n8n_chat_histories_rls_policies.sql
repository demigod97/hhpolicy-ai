-- Fix RLS policies on n8n_chat_histories to work with chat_sessions architecture
--
-- Problem: Old policies check is_policy_document_owner() which looks in policy_documents table
-- Solution: Create is_chat_session_owner() that checks chat_sessions table

-- Create helper function to check if user owns a chat session
CREATE OR REPLACE FUNCTION is_chat_session_owner(chat_session_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_sessions
        WHERE id = chat_session_id_param
        AND user_id = auth.uid()
    );
$$;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view chat histories from their policy documents" ON n8n_chat_histories;
DROP POLICY IF EXISTS "Users can create chat histories in their policy documents" ON n8n_chat_histories;
DROP POLICY IF EXISTS "Users can delete chat histories from their policy documents" ON n8n_chat_histories;

-- Create new RLS policies using chat_sessions
CREATE POLICY "Users can view their own chat histories"
  ON n8n_chat_histories
  FOR SELECT
  USING (is_chat_session_owner(session_id));

CREATE POLICY "Users can create chat histories in their sessions"
  ON n8n_chat_histories
  FOR INSERT
  WITH CHECK (is_chat_session_owner(session_id));

CREATE POLICY "Users can delete their own chat histories"
  ON n8n_chat_histories
  FOR DELETE
  USING (is_chat_session_owner(session_id));

-- Also allow service role to bypass RLS (for N8N)
-- This is already handled by Supabase, but we're being explicit
COMMENT ON FUNCTION is_chat_session_owner(uuid) IS
  'Checks if the authenticated user owns the specified chat session';
