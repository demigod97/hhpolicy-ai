-- ============================================================================
-- Migration: Native Chat Sessions for AG-UI and CopilotKit
-- Epic 2: AI-Powered Chat Experience
-- Story 2.1: AG-UI + CopilotKit Integration & Setup
-- Story 2.2: Role-Based Chat Interface (replaces n8n webhooks)
-- 
-- This migration creates native chat session and message tables to replace
-- the n8n-specific chat system. Supports AG-UI protocol, CopilotKit features,
-- streaming responses, citations, and favorites.
-- ============================================================================

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.policy_documents(id) ON DELETE SET NULL,
  
  -- Session metadata
  title TEXT,
  description TEXT,
  
  -- AG-UI specific fields
  agent_state JSONB DEFAULT '{}'::jsonb, -- Current agent state
  context_data JSONB DEFAULT '{}'::jsonb, -- Session context
  agent_config JSONB DEFAULT '{}'::jsonb, -- Agent configuration
  
  -- User preferences
  is_favorite BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Statistics
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  
  -- Citations and sources
  citations JSONB DEFAULT '[]'::jsonb, -- Array of citation objects
  sources JSONB DEFAULT '[]'::jsonb, -- Referenced source documents
  
  -- Token tracking
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Model information
  model_used TEXT,
  provider TEXT,
  
  -- Message metadata
  message_index INTEGER, -- Order in conversation
  parent_message_id UUID REFERENCES public.chat_messages(id), -- For threading
  
  -- Streaming status
  is_streaming BOOLEAN DEFAULT false,
  is_complete BOOLEAN DEFAULT true,
  
  -- User feedback
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  was_helpful BOOLEAN,
  
  -- AG-UI specific
  tool_calls JSONB DEFAULT '[]'::jsonb, -- Tool invocations
  tool_results JSONB DEFAULT '[]'::jsonb, -- Tool outputs
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for chat_sessions
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_notebook_id ON public.chat_sessions(notebook_id) WHERE notebook_id IS NOT NULL;
CREATE INDEX idx_chat_sessions_created ON public.chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_updated ON public.chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_sessions_last_message ON public.chat_sessions(last_message_at DESC) WHERE last_message_at IS NOT NULL;
CREATE INDEX idx_chat_sessions_favorite ON public.chat_sessions(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_chat_sessions_pinned ON public.chat_sessions(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_chat_sessions_archived ON public.chat_sessions(is_archived) WHERE is_archived = false;

-- Create indexes for chat_messages
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX idx_chat_messages_index ON public.chat_messages(session_id, message_index);
CREATE INDEX idx_chat_messages_parent ON public.chat_messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX idx_chat_messages_rating ON public.chat_messages(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX idx_chat_messages_streaming ON public.chat_messages(is_streaming) WHERE is_streaming = true;

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions

-- Users can view their own sessions
CREATE POLICY "users_view_own_sessions" ON public.chat_sessions
FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own sessions
CREATE POLICY "users_create_own_sessions" ON public.chat_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "users_update_own_sessions" ON public.chat_sessions
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own sessions
CREATE POLICY "users_delete_own_sessions" ON public.chat_sessions
FOR DELETE
USING (user_id = auth.uid());

-- Company operators can view all sessions (for monitoring)
CREATE POLICY "operators_view_all_sessions" ON public.chat_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- RLS Policies for chat_messages

-- Users can view messages from their sessions
CREATE POLICY "users_view_own_messages" ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE id = chat_messages.session_id
    AND user_id = auth.uid()
  )
);

-- Users can create messages in their sessions
CREATE POLICY "users_create_own_messages" ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE id = chat_messages.session_id
    AND user_id = auth.uid()
  )
);

-- Users can update messages in their sessions (for feedback)
CREATE POLICY "users_update_own_messages" ON public.chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE id = chat_messages.session_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE id = chat_messages.session_id
    AND user_id = auth.uid()
  )
);

-- Users can delete messages from their sessions
CREATE POLICY "users_delete_own_messages" ON public.chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE id = chat_messages.session_id
    AND user_id = auth.uid()
  )
);

-- Function to update session updated_at and last_message_at
CREATE OR REPLACE FUNCTION update_chat_session_on_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.chat_sessions
  SET 
    updated_at = NOW(),
    last_message_at = NOW(),
    message_count = message_count + 1,
    total_tokens_used = total_tokens_used + COALESCE(NEW.total_tokens, 0)
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session on new message
CREATE TRIGGER update_chat_session_on_message_trigger
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_session_on_message();

-- Function to update message_index automatically
CREATE OR REPLACE FUNCTION set_message_index()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_index INTEGER;
BEGIN
  IF NEW.message_index IS NULL THEN
    SELECT COALESCE(MAX(message_index), 0) + 1
    INTO next_index
    FROM public.chat_messages
    WHERE session_id = NEW.session_id;
    
    NEW.message_index = next_index;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set message index
CREATE TRIGGER set_message_index_trigger
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION set_message_index();

-- Function to update chat_sessions updated_at
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sessions updated_at
CREATE TRIGGER update_chat_sessions_updated_at_trigger
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Function to update chat_messages updated_at
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for messages updated_at
CREATE TRIGGER update_chat_messages_updated_at_trigger
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_messages_updated_at();

-- View for session summaries
CREATE OR REPLACE VIEW public.chat_session_summaries AS
SELECT 
  cs.id,
  cs.user_id,
  cs.notebook_id,
  cs.title,
  cs.description,
  cs.is_favorite,
  cs.is_pinned,
  cs.is_archived,
  cs.message_count,
  cs.total_tokens_used,
  cs.created_at,
  cs.updated_at,
  cs.last_message_at,
  -- Latest message preview
  (
    SELECT cm.content
    FROM public.chat_messages cm
    WHERE cm.session_id = cs.id
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) as last_message_preview,
  -- User info
  p.full_name as user_name,
  p.email as user_email
FROM public.chat_sessions cs
LEFT JOIN public.profiles p ON p.id = cs.user_id;

-- Grant access
GRANT SELECT ON public.chat_session_summaries TO authenticated;

-- Add comments
COMMENT ON TABLE public.chat_sessions IS 
'Native chat sessions supporting AG-UI protocol and CopilotKit. Replaces n8n-based chat system.';

COMMENT ON TABLE public.chat_messages IS 
'Individual chat messages with full support for citations, streaming, tool calls, and user feedback.';

COMMENT ON COLUMN public.chat_sessions.agent_state IS 
'Current AG-UI agent state for session continuity.';

COMMENT ON COLUMN public.chat_messages.citations IS 
'Array of citation objects with source_id, chunk_index, lines_from, lines_to.';

COMMENT ON COLUMN public.chat_messages.tool_calls IS 
'AG-UI tool invocations made during message generation.';

COMMENT ON VIEW public.chat_session_summaries IS 
'Convenient view of chat sessions with user info and last message preview.';

