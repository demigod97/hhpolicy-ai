-- Migration: Auto-sync n8n_chat_histories to chat_sessions
-- This trigger automatically updates chat_sessions table whenever a new message is added to n8n_chat_histories
-- It updates: message_count, last_message_at, updated_at

-- Create function to sync chat session stats
CREATE OR REPLACE FUNCTION sync_chat_session_from_n8n()
RETURNS TRIGGER AS $$
DECLARE
  v_message_count INT;
  v_total_tokens INT;
  v_user_message_count INT;
  v_ai_message_count INT;
BEGIN
  -- Count total messages for this session
  SELECT COUNT(*) INTO v_message_count
  FROM n8n_chat_histories
  WHERE session_id = NEW.session_id;

  -- Count user vs AI messages
  SELECT
    COUNT(*) FILTER (WHERE message->>'type' = 'human') as user_msgs,
    COUNT(*) FILTER (WHERE message->>'type' = 'ai') as ai_msgs
  INTO v_user_message_count, v_ai_message_count
  FROM n8n_chat_histories
  WHERE session_id = NEW.session_id;

  -- Estimate total tokens (rough calculation based on message length)
  -- Average token count is roughly 1 token per 4 characters
  SELECT
    SUM(LENGTH(message::text) / 4)::INT
  INTO v_total_tokens
  FROM n8n_chat_histories
  WHERE session_id = NEW.session_id;

  -- Update chat_sessions table
  UPDATE chat_sessions
  SET
    message_count = v_message_count,
    total_tokens_used = COALESCE(v_total_tokens, 0),
    last_message_at = NOW(),
    updated_at = NOW(),
    context_data = jsonb_build_object(
      'user_message_count', v_user_message_count,
      'ai_message_count', v_ai_message_count,
      'last_synced_at', NOW()
    )
  WHERE id = NEW.session_id;

  -- If chat_sessions record doesn't exist yet, log a warning
  IF NOT FOUND THEN
    RAISE WARNING 'Chat session % not found when syncing from n8n_chat_histories', NEW.session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on n8n_chat_histories
DROP TRIGGER IF EXISTS trigger_sync_chat_session ON n8n_chat_histories;

CREATE TRIGGER trigger_sync_chat_session
  AFTER INSERT ON n8n_chat_histories
  FOR EACH ROW
  EXECUTE FUNCTION sync_chat_session_from_n8n();

-- Backfill existing data (update all chat_sessions with current counts)
DO $$
DECLARE
  v_session_record RECORD;
  v_message_count INT;
  v_total_tokens INT;
  v_user_message_count INT;
  v_ai_message_count INT;
BEGIN
  FOR v_session_record IN
    SELECT DISTINCT session_id
    FROM n8n_chat_histories
  LOOP
    -- Count messages for this session
    SELECT COUNT(*) INTO v_message_count
    FROM n8n_chat_histories
    WHERE session_id = v_session_record.session_id;

    -- Count user vs AI messages
    SELECT
      COUNT(*) FILTER (WHERE message->>'type' = 'human') as user_msgs,
      COUNT(*) FILTER (WHERE message->>'type' = 'ai') as ai_msgs
    INTO v_user_message_count, v_ai_message_count
    FROM n8n_chat_histories
    WHERE session_id = v_session_record.session_id;

    -- Estimate total tokens
    SELECT
      SUM(LENGTH(message::text) / 4)::INT
    INTO v_total_tokens
    FROM n8n_chat_histories
    WHERE session_id = v_session_record.session_id;

    -- Update the chat_sessions record
    UPDATE chat_sessions
    SET
      message_count = v_message_count,
      total_tokens_used = COALESCE(v_total_tokens, 0),
      last_message_at = (
        SELECT created_at
        FROM n8n_chat_histories
        WHERE session_id = v_session_record.session_id
        ORDER BY id DESC
        LIMIT 1
      ),
      updated_at = NOW(),
      context_data = jsonb_build_object(
        'user_message_count', v_user_message_count,
        'ai_message_count', v_ai_message_count,
        'last_synced_at', NOW()
      )
    WHERE id = v_session_record.session_id;
  END LOOP;

  RAISE NOTICE 'Backfilled chat_sessions with data from n8n_chat_histories';
END $$;

-- Add helpful comment
COMMENT ON FUNCTION sync_chat_session_from_n8n() IS
  'Automatically syncs chat session statistics from n8n_chat_histories to chat_sessions table. '
  'Updates message_count, total_tokens_used, last_message_at, and context_data.';
