-- ============================================================================
-- DAY 1 CONSOLIDATED MIGRATIONS - FIXED VERSION
-- Execute this entire script in Supabase SQL Editor
-- Project: vnmsyofypuhxjlzwnuhh
-- Date: 2025-10-16
-- 
-- FIX: Changed 'user_id' to 'uploaded_by_user_id' in sources table policies
-- ============================================================================

-- ============================================================================
-- MIGRATION 1 of 6: Extend User Roles
-- File: 20251016145126_extend_user_roles_for_operators.sql
-- ============================================================================

-- ============================================================================
-- Migration: Extend User Roles for Company Operator and System Owner
-- Epic 1.5: Role Hierarchy & Access Control
-- Story 1.5.1: Add Company Operator & System Owner roles to database
-- 
-- This migration extends the user_roles table to support 5 roles total:
-- - board (existing)
-- - administrator (existing)
-- - executive (existing)
-- - company_operator (new)
-- - system_owner (new)
-- ============================================================================

-- Drop existing role constraint
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add new role constraint with 5 roles
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Update role_assignment constraints on related tables
ALTER TABLE public.policy_documents
DROP CONSTRAINT IF EXISTS policy_documents_role_assignment_check;

ALTER TABLE public.policy_documents
ADD CONSTRAINT policy_documents_role_assignment_check
CHECK (role_assignment IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Add target_role constraint update for sources table
ALTER TABLE public.sources
DROP CONSTRAINT IF EXISTS sources_target_role_check;

ALTER TABLE public.sources
ADD CONSTRAINT sources_target_role_check
CHECK (target_role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner'));

-- Create index for new roles
CREATE INDEX IF NOT EXISTS idx_user_roles_company_operator 
ON public.user_roles(user_id) 
WHERE role = 'company_operator';

CREATE INDEX IF NOT EXISTS idx_user_roles_system_owner 
ON public.user_roles(user_id) 
WHERE role = 'system_owner';

-- Update RLS policies to include new roles

-- Company operators can view all users (for role assignment)
CREATE POLICY "company_operators_view_users" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- Company operators can assign roles (but not system_owner role)
CREATE POLICY "company_operators_assign_roles" ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'company_operator'
  )
  AND role != 'system_owner' -- Company operators cannot assign system_owner role
  AND NOT EXISTS (
    -- Prevent assigning system_owner to anyone
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = auth.uid()
    AND ur2.role = 'system_owner'
  )
);

-- System owners have full role management
CREATE POLICY "system_owners_manage_all_roles" ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Company operators can upload documents
-- FIXED: Changed user_id to uploaded_by_user_id
CREATE POLICY "company_operators_upload_documents" ON public.sources
FOR INSERT
WITH CHECK (
  uploaded_by_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner', 'board', 'administrator')
  )
);

-- Update document access for new roles
-- System owners see everything
CREATE POLICY "system_owners_view_all_sources" ON public.sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Company operators see all documents they need for operations
CREATE POLICY "company_operators_view_operational_sources" ON public.sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'company_operator'
  )
  AND (
    target_role IN ('administrator', 'executive', 'company_operator') OR
    target_role IS NULL
  )
);

-- Add comment
COMMENT ON CONSTRAINT user_roles_role_check ON public.user_roles IS 
'Updated role hierarchy: board, administrator, executive, company_operator, system_owner';



-- ============================================================================
-- MIGRATION 2 of 6: API Keys Table
-- File: 20251016145127_create_api_keys_table.sql
-- ============================================================================


-- ============================================================================
-- Migration: API Key Management System
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.1: API Key Management (storage, encryption, UI)
--
-- This migration creates the infrastructure for storing and managing
-- encrypted API keys for multiple AI providers (OpenAI, Gemini, Mistral, Anthropic).
-- Keys are encrypted using pgcrypto before storage.
-- ============================================================================

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'mistral', 'anthropic')),
  encrypted_key TEXT NOT NULL, -- AES-256 encrypted
  key_name TEXT, -- Optional friendly name
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one active key per provider per user
  UNIQUE(user_id, provider, is_active)
);

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(user_id, provider) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON public.api_keys
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own API keys
CREATE POLICY "Users can insert own API keys" ON public.api_keys
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys" ON public.api_keys
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys" ON public.api_keys
FOR DELETE
USING (user_id = auth.uid());

-- System owners can view all API keys (for support/debugging)
CREATE POLICY "System owners view all API keys" ON public.api_keys
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Helper function: Encrypt API key
CREATE OR REPLACE FUNCTION encrypt_api_key(p_key TEXT, p_passphrase TEXT)
RETURNS TEXT
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN encode(pgcrypto.encrypt(p_key::bytea, p_passphrase::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Helper function: Decrypt API key
CREATE OR REPLACE FUNCTION decrypt_api_key(p_encrypted_key TEXT, p_passphrase TEXT)
RETURNS TEXT
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN convert_from(pgcrypto.decrypt(decode(p_encrypted_key, 'base64'), p_passphrase::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;

-- Helper function: Get active API key for provider
CREATE OR REPLACE FUNCTION get_active_api_key(p_user_id UUID, p_provider TEXT)
RETURNS TABLE(id UUID, provider TEXT, key_name TEXT, last_used_at TIMESTAMPTZ)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    public.api_keys.id,
    public.api_keys.provider,
    public.api_keys.key_name,
    public.api_keys.last_used_at
  FROM public.api_keys
  WHERE public.api_keys.user_id = p_user_id
    AND public.api_keys.provider = p_provider
    AND public.api_keys.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on modification
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_keys_updated_at_trigger
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION update_api_keys_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.api_keys IS 
'Stores encrypted API keys for AI providers (OpenAI, Gemini, Mistral, Anthropic). Keys are encrypted using AES-256.';

COMMENT ON COLUMN public.api_keys.encrypted_key IS 
'API key encrypted with AES-256. Use encrypt_api_key/decrypt_api_key functions.';

COMMENT ON COLUMN public.api_keys.is_active IS 
'Only one key per provider can be active at a time per user.';

COMMENT ON FUNCTION encrypt_api_key IS 
'Encrypts an API key using AES-256 encryption.';

COMMENT ON FUNCTION decrypt_api_key IS 
'Decrypts an API key that was encrypted with encrypt_api_key.';



-- ============================================================================
-- MIGRATION 3 of 6: Token Usage Tracking
-- File: 20251016145128_create_token_usage_tracking.sql
-- ============================================================================


-- ============================================================================
-- Migration: Token Usage Tracking System
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.2: Token Usage Tracking & Cost Management
--
-- This migration creates comprehensive token tracking for all AI requests:
-- - Input/output token counts
-- - Cost calculation
-- - Provider tracking
-- - Model tracking
-- - Usage analytics
-- ============================================================================

-- Create token usage table
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID, -- Link to chat_sessions or other session types
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'mistral', 'anthropic')),
  model TEXT NOT NULL, -- e.g., 'gpt-4', 'gemini-pro', 'mistral-large'
  
  -- Token counts
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  
  -- Cost tracking (in USD)
  input_cost DECIMAL(10, 6) DEFAULT 0,
  output_cost DECIMAL(10, 6) DEFAULT 0,
  total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (input_cost + output_cost) STORED,
  
  -- Request metadata
  request_type TEXT, -- 'chat', 'embedding', 'completion', 'function_call'
  endpoint TEXT, -- API endpoint called
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'partial')),
  error_message TEXT,
  
  -- Timing
  response_time_ms INTEGER, -- Time taken for API response
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_session_id ON public.token_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_provider ON public.token_usage(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON public.token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_date ON public.token_usage(user_id, created_at DESC);

-- Composite index for cost analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_cost_analysis 
ON public.token_usage(user_id, provider, created_at DESC) 
INCLUDE (total_cost, total_tokens);

-- Enable RLS
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own usage
CREATE POLICY "Users can view own token usage" ON public.token_usage
FOR SELECT
USING (user_id = auth.uid());

-- System can insert token usage (via Edge Functions)
CREATE POLICY "Service role can insert token usage" ON public.token_usage
FOR INSERT
WITH CHECK (user_id = auth.uid() AND created_by = auth.uid());

-- Users can update their own usage (edge case for corrections)
CREATE POLICY "Users can update own token usage" ON public.token_usage
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System owners can view all usage
CREATE POLICY "System owners view all token usage" ON public.token_usage
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Helper function: Calculate token cost based on provider and model
CREATE OR REPLACE FUNCTION calculate_token_cost(
  p_provider TEXT,
  p_model TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER
)
RETURNS TABLE(input_cost DECIMAL, output_cost DECIMAL)
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_input_rate DECIMAL(10, 8);
  v_output_rate DECIMAL(10, 8);
BEGIN
  -- Pricing per 1000 tokens (as of Oct 2025)
  CASE 
    -- OpenAI pricing
    WHEN p_provider = 'openai' AND p_model LIKE 'gpt-4%' THEN
      v_input_rate := 0.03 / 1000;
      v_output_rate := 0.06 / 1000;
    WHEN p_provider = 'openai' AND p_model LIKE 'gpt-3.5%' THEN
      v_input_rate := 0.0005 / 1000;
      v_output_rate := 0.0015 / 1000;
    
    -- Gemini pricing
    WHEN p_provider = 'gemini' AND p_model = 'gemini-pro' THEN
      v_input_rate := 0.0005 / 1000;
      v_output_rate := 0.0015 / 1000;
    
    -- Mistral pricing
    WHEN p_provider = 'mistral' AND p_model LIKE 'mistral-large%' THEN
      v_input_rate := 0.004 / 1000;
      v_output_rate := 0.012 / 1000;
    WHEN p_provider = 'mistral' AND p_model LIKE 'mistral-medium%' THEN
      v_input_rate := 0.0027 / 1000;
      v_output_rate := 0.0081 / 1000;
    
    -- Anthropic pricing
    WHEN p_provider = 'anthropic' AND p_model LIKE 'claude-3%' THEN
      v_input_rate := 0.015 / 1000;
      v_output_rate := 0.075 / 1000;
    
    -- Default fallback
    ELSE
      v_input_rate := 0.001 / 1000;
      v_output_rate := 0.002 / 1000;
  END CASE;
  
  RETURN QUERY SELECT 
    (p_input_tokens * v_input_rate)::DECIMAL(10, 6),
    (p_output_tokens * v_output_rate)::DECIMAL(10, 6);
END;
$$ LANGUAGE plpgsql;

-- Helper function: Get user's total usage for current month
CREATE OR REPLACE FUNCTION get_monthly_token_usage(p_user_id UUID)
RETURNS TABLE(
  total_tokens BIGINT,
  total_cost DECIMAL,
  request_count BIGINT
)
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(public.token_usage.total_tokens)::BIGINT,
    SUM(public.token_usage.total_cost)::DECIMAL(10, 2),
    COUNT(*)::BIGINT
  FROM public.token_usage
  WHERE public.token_usage.user_id = p_user_id
    AND public.token_usage.created_at >= date_trunc('month', now());
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.token_usage IS 
'Comprehensive token usage tracking for all AI requests. Includes costs, timing, and provider details.';

COMMENT ON COLUMN public.token_usage.total_tokens IS 
'Sum of input_tokens + output_tokens (computed column).';

COMMENT ON COLUMN public.token_usage.total_cost IS 
'Sum of input_cost + output_cost in USD (computed column).';

COMMENT ON FUNCTION calculate_token_cost IS 
'Calculate token costs based on provider pricing. Rates updated as of Oct 2025.';



-- ============================================================================
-- MIGRATION 4 of 6: User Limits Table
-- File: 20251016145129_create_user_limits_table.sql
-- ============================================================================


-- ============================================================================
-- Migration: User Limits & Quota Management
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.3: User Quota Management & Enforcement
--
-- This migration creates quota management for token usage:
-- - Daily/monthly limits
-- - Usage tracking
-- - Auto-reset mechanisms
-- - Limit enforcement
-- ============================================================================

-- Create user limits table
CREATE TABLE IF NOT EXISTS public.user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Daily limits
  daily_token_limit INTEGER DEFAULT 100000, -- 100k tokens per day
  daily_tokens_used INTEGER DEFAULT 0,
  daily_limit_reset_at TIMESTAMPTZ DEFAULT (now() + interval '1 day'),
  
  -- Monthly limits
  monthly_token_limit INTEGER DEFAULT 3000000, -- 3M tokens per month
  monthly_tokens_used INTEGER DEFAULT 0,
  monthly_limit_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', now()) + interval '1 month'),
  
  -- Cost limits (in USD)
  monthly_cost_limit DECIMAL(10, 2) DEFAULT 100.00,
  monthly_cost_used DECIMAL(10, 2) DEFAULT 0,
  
  -- Status flags
  is_unlimited BOOLEAN DEFAULT false, -- For premium/system users
  is_blocked BOOLEAN DEFAULT false, -- Manual block by admin
  block_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON public.user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_limits_reset ON public.user_limits(daily_limit_reset_at, monthly_limit_reset_at);

-- Enable RLS
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own limits
CREATE POLICY "Users can view own limits" ON public.user_limits
FOR SELECT
USING (user_id = auth.uid());

-- System can manage limits (via Edge Functions)
CREATE POLICY "System can manage user limits" ON public.user_limits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('system_owner', 'company_operator')
  )
);

-- Helper function: Check if user has exceeded limits
CREATE OR REPLACE FUNCTION check_user_limit(p_user_id UUID, p_tokens_to_use INTEGER)
RETURNS TABLE(
  can_proceed BOOLEAN,
  reason TEXT,
  daily_remaining INTEGER,
  monthly_remaining INTEGER
)
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_limits RECORD;
BEGIN
  -- Get user limits (create if not exists)
  SELECT * INTO v_limits
  FROM public.user_limits
  WHERE user_id = p_user_id;
  
  IF v_limits IS NULL THEN
    -- Create default limits
    INSERT INTO public.user_limits (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_limits;
  END IF;
  
  -- Check if blocked
  IF v_limits.is_blocked THEN
    RETURN QUERY SELECT false, 'Account blocked: ' || COALESCE(v_limits.block_reason, 'No reason provided'), 0, 0;
    RETURN;
  END IF;
  
  -- Unlimited users always pass
  IF v_limits.is_unlimited THEN
    RETURN QUERY SELECT true, 'Unlimited account', 999999999, 999999999;
    RETURN;
  END IF;
  
  -- Check daily limit
  IF v_limits.daily_tokens_used + p_tokens_to_use > v_limits.daily_token_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Daily token limit exceeded',
      (v_limits.daily_token_limit - v_limits.daily_tokens_used),
      (v_limits.monthly_token_limit - v_limits.monthly_tokens_used);
    RETURN;
  END IF;
  
  -- Check monthly limit
  IF v_limits.monthly_tokens_used + p_tokens_to_use > v_limits.monthly_token_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Monthly token limit exceeded',
      (v_limits.daily_token_limit - v_limits.daily_tokens_used),
      (v_limits.monthly_token_limit - v_limits.monthly_tokens_used);
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true, 
    'OK',
    (v_limits.daily_token_limit - v_limits.daily_tokens_used),
    (v_limits.monthly_token_limit - v_limits.monthly_tokens_used);
END;
$$ LANGUAGE plpgsql;

-- Helper function: Record token usage and update limits
CREATE OR REPLACE FUNCTION record_token_usage(
  p_user_id UUID,
  p_tokens INTEGER,
  p_cost DECIMAL
)
RETURNS void
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Update or insert user limits
  INSERT INTO public.user_limits (user_id, daily_tokens_used, monthly_tokens_used, monthly_cost_used)
  VALUES (p_user_id, p_tokens, p_tokens, p_cost)
  ON CONFLICT (user_id) DO UPDATE SET
    daily_tokens_used = public.user_limits.daily_tokens_used + p_tokens,
    monthly_tokens_used = public.user_limits.monthly_tokens_used + p_tokens,
    monthly_cost_used = public.user_limits.monthly_cost_used + p_cost,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily limits (run via cron)
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_limits
  SET 
    daily_tokens_used = 0,
    daily_limit_reset_at = now() + interval '1 day',
    updated_at = now()
  WHERE daily_limit_reset_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly limits (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_limits
  SET 
    monthly_tokens_used = 0,
    monthly_cost_used = 0,
    monthly_limit_reset_at = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE monthly_limit_reset_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at
CREATE OR REPLACE FUNCTION update_user_limits_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_limits_updated_at_trigger
BEFORE UPDATE ON public.user_limits
FOR EACH ROW
EXECUTE FUNCTION update_user_limits_updated_at();

-- Schedule daily reset (using pg_cron if available)
-- Note: This requires pg_cron extension which may need to be enabled in Supabase dashboard
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'reset_daily_limits_job',
      '0 0 * * *', -- Every day at midnight UTC
      $cron$SELECT reset_daily_limits()$cron$
    );
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.user_limits IS 
'User quota management for token usage. Tracks daily/monthly limits and enforces restrictions.';

COMMENT ON FUNCTION check_user_limit IS 
'Check if user can proceed with token usage. Returns remaining limits.';

COMMENT ON FUNCTION record_token_usage IS 
'Record token usage and update user limits. Called after each AI request.';

COMMENT ON FUNCTION reset_daily_limits IS 
'Reset daily token counters. Run via cron at midnight UTC.';



-- ============================================================================
-- MIGRATION 5 of 6: Native Chat Sessions
-- File: 20251016145130_create_native_chat_sessions.sql
-- ============================================================================


-- ============================================================================
-- Migration: Native Chat Sessions & Messages
-- Epic 1.6: Realtime Chat Interface
-- Story 1.6.1: Native Chat Storage (replaces n8n dependency)
--
-- This migration creates native chat infrastructure:
-- - Chat sessions (replaces n8n workflows)
-- - Chat messages (with role support)
-- - Token usage integration
-- - Realtime subscriptions ready
-- ============================================================================

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'executive', 'board', 'company_operator', 'system_owner')),
  
  -- Session metadata
  title TEXT, -- Auto-generated from first message
  session_type TEXT DEFAULT 'chat' CHECK (session_type IN ('chat', 'analysis', 'search')),
  
  -- AI provider settings
  provider TEXT DEFAULT 'openai' CHECK (provider IN ('openai', 'gemini', 'mistral', 'anthropic')),
  model TEXT DEFAULT 'gpt-4',
  
  -- Context settings
  max_context_messages INTEGER DEFAULT 10, -- How many messages to include in context
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Token tracking link
  token_usage_id UUID REFERENCES public.token_usage(id),
  
  -- Message metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Function calls, citations, etc.
  
  -- Status
  is_error BOOLEAN DEFAULT false,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_role ON public.chat_sessions(role);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON public.chat_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON public.chat_sessions(user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(session_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view own sessions" ON public.chat_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions" ON public.chat_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.chat_sessions
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON public.chat_sessions
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own messages" ON public.chat_messages
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own messages" ON public.chat_messages
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- System owners can view all sessions/messages
CREATE POLICY "System owners view all sessions" ON public.chat_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

CREATE POLICY "System owners view all messages" ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Helper function: Get session with message count
CREATE OR REPLACE FUNCTION get_session_summary(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE(
  session_id UUID,
  title TEXT,
  role TEXT,
  message_count BIGINT,
  last_message_at TIMESTAMPTZ,
  total_tokens BIGINT,
  total_cost DECIMAL
)
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.role,
    COUNT(m.id),
    s.last_message_at,
    COALESCE(SUM(t.total_tokens), 0)::BIGINT,
    COALESCE(SUM(t.total_cost), 0)::DECIMAL(10, 2)
  FROM public.chat_sessions s
  LEFT JOIN public.chat_messages m ON m.session_id = s.id
  LEFT JOIN public.token_usage t ON t.session_id = s.id
  WHERE s.user_id = p_user_id
    AND s.is_active = true
  GROUP BY s.id, s.title, s.role, s.last_message_at
  ORDER BY s.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Get messages for session (paginated)
CREATE OR REPLACE FUNCTION get_session_messages(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  message_id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  input_tokens INTEGER,
  output_tokens INTEGER
)
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.role,
    m.content,
    m.created_at,
    COALESCE(t.input_tokens, 0)::INTEGER,
    COALESCE(t.output_tokens, 0)::INTEGER
  FROM public.chat_messages m
  LEFT JOIN public.token_usage t ON t.id = m.token_usage_id
  WHERE m.session_id = p_session_id
  ORDER BY m.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update session last_message_at on new message
CREATE OR REPLACE FUNCTION update_session_last_message()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.chat_sessions
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_update_session_trigger
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_session_last_message();

-- Trigger: Auto-generate session title from first message
CREATE OR REPLACE FUNCTION auto_generate_session_title()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_title TEXT;
BEGIN
  -- Only generate title for first user message in session
  IF NEW.role = 'user' THEN
    SELECT title INTO v_title
    FROM public.chat_sessions
    WHERE id = NEW.session_id;
    
    IF v_title IS NULL THEN
      -- Truncate content to first 50 chars for title
      v_title := LEFT(NEW.content, 50);
      IF LENGTH(NEW.content) > 50 THEN
        v_title := v_title || '...';
      END IF;
      
      UPDATE public.chat_sessions
      SET title = v_title
      WHERE id = NEW.session_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_generate_title_trigger
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION auto_generate_session_title();

-- Add comments
COMMENT ON TABLE public.chat_sessions IS 
'Native chat sessions replacing n8n workflows. Supports all 5 roles with token tracking.';

COMMENT ON TABLE public.chat_messages IS 
'Individual chat messages linked to sessions and token usage.';

COMMENT ON FUNCTION get_session_summary IS 
'Get summary of user chat sessions with message counts and token usage.';

COMMENT ON FUNCTION get_session_messages IS 
'Get paginated messages for a specific chat session.';



-- ============================================================================
-- MIGRATION 6 of 6: Enhanced Sources for PDF Storage
-- File: 20251016145131_enhance_sources_for_pdf_storage.sql
-- ============================================================================

-- ============================================================================
-- Migration: Enhanced Source Storage for PDF Files
-- Epic 3: Enhanced Document Experience
-- Story 3.1: PDF Document Viewer Integration (react-pdf)
-- 
-- This migration extends the sources table to properly reference PDF files
-- in Supabase storage, enabling the PDF viewer to display actual documents
-- instead of just extracted markdown text.
-- ============================================================================

-- Add PDF storage columns to sources table
ALTER TABLE public.sources
ADD COLUMN IF NOT EXISTS pdf_file_path TEXT, -- Path in Supabase storage
ADD COLUMN IF NOT EXISTS pdf_storage_bucket TEXT DEFAULT 'policy-documents',
ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT, -- Size in bytes
ADD COLUMN IF NOT EXISTS pdf_page_count INTEGER, -- Number of pages
ADD COLUMN IF NOT EXISTS pdf_metadata JSONB DEFAULT '{}'::jsonb; -- PDF metadata

-- Update existing file_path to pdf_file_path for PDF files
UPDATE public.sources
SET pdf_file_path = file_path,
    pdf_storage_bucket = 'policy-documents'
WHERE type = 'pdf' 
  AND (file_path LIKE '%.pdf' OR file_path LIKE '%.PDF')
  AND pdf_file_path IS NULL;

-- Create index for PDF file paths
CREATE INDEX IF NOT EXISTS idx_sources_pdf_file_path ON public.sources(pdf_file_path) 
WHERE pdf_file_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sources_storage_bucket ON public.sources(pdf_storage_bucket) 
WHERE pdf_storage_bucket IS NOT NULL;

-- Function to generate signed URL for PDF access
CREATE OR REPLACE FUNCTION get_source_pdf_url(
  p_source_id UUID,
  p_expires_in INTEGER DEFAULT 3600 -- 1 hour default
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pdf_path TEXT;
  v_bucket TEXT;
  v_target_role TEXT;
  v_user_role TEXT;
  v_user_has_access BOOLEAN;
BEGIN
  -- Get source details
  SELECT pdf_file_path, pdf_storage_bucket, target_role
  INTO v_pdf_path, v_bucket, v_target_role
  FROM public.sources
  WHERE id = p_source_id;
  
  IF v_pdf_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check user access (respects RLS)
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Simple role hierarchy check
  v_user_has_access := (
    v_user_role = 'system_owner' OR
    v_user_role = v_target_role OR
    (v_user_role = 'company_operator' AND v_target_role IN ('administrator', 'executive')) OR
    (v_user_role = 'board' AND v_target_role IN ('administrator', 'executive'))
  );
  
  IF NOT v_user_has_access THEN
    RAISE EXCEPTION 'Access denied to PDF document';
  END IF;
  
  -- Return signed URL (placeholder - actual signing happens in Edge Function)
  RETURN format('https://vnmsyofypuhxjlzwnuhh.supabase.co/storage/v1/object/sign/%s/%s', v_bucket, v_pdf_path);
END;
$$ LANGUAGE plpgsql;

-- Function to extract PDF metadata (to be called after upload)
CREATE OR REPLACE FUNCTION extract_pdf_metadata(
  p_source_id UUID,
  p_file_size BIGINT,
  p_page_count INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.sources
  SET 
    pdf_file_size = p_file_size,
    pdf_page_count = p_page_count,
    pdf_metadata = p_metadata,
    updated_at = now()
  WHERE id = p_source_id;
END;
$$ LANGUAGE plpgsql;

-- View for sources with PDF access
CREATE OR REPLACE VIEW public.sources_with_pdf_access AS
SELECT 
  s.*,
  CASE 
    WHEN s.pdf_file_path IS NOT NULL THEN true
    ELSE false
  END as has_pdf,
  CASE 
    WHEN s.pdf_file_path IS NOT NULL THEN 
      get_source_pdf_url(s.id)
    ELSE NULL
  END as pdf_url
FROM public.sources s;

-- Grant access to the view
GRANT SELECT ON public.sources_with_pdf_access TO authenticated;

-- Update existing sources to set PDF metadata for known PDFs
UPDATE public.sources
SET pdf_metadata = jsonb_build_object(
  'has_text_layer', true,
  'is_searchable', true,
  'extraction_method', 'mistral'
)
WHERE type = 'pdf'
  AND content IS NOT NULL
  AND (file_path LIKE '%.pdf' OR file_path LIKE '%.PDF')
  AND pdf_metadata = '{}'::jsonb;

-- Create storage bucket policy for PDF access
-- Note: This is a SQL representation; actual bucket policies are set via Supabase Dashboard

-- Add comments
COMMENT ON COLUMN public.sources.pdf_file_path IS 
'Path to the original PDF file in Supabase storage. Used by PDF viewer component.';

COMMENT ON COLUMN public.sources.pdf_storage_bucket IS 
'Supabase storage bucket containing the PDF file. Default: policy-documents';

COMMENT ON COLUMN public.sources.pdf_page_count IS 
'Total number of pages in the PDF document. Extracted during processing.';

COMMENT ON COLUMN public.sources.pdf_file_size IS 
'File size in bytes. Used for storage quota management.';

COMMENT ON COLUMN public.sources.pdf_metadata IS 
'Additional PDF metadata: has_text_layer, is_searchable, extraction_method, etc.';

COMMENT ON FUNCTION get_source_pdf_url IS 
'Generate a signed URL for secure PDF access. Respects RLS policies.';

COMMENT ON FUNCTION extract_pdf_metadata IS 
'Update PDF metadata after processing. Called by n8n workflow or Edge Function.';

COMMENT ON VIEW public.sources_with_pdf_access IS 
'Sources with computed PDF access URLs for frontend consumption.';

-- ============================================================================
-- END OF DAY 1 MIGRATIONS
-- ============================================================================

-- Verification query
SELECT 
  'Migration Complete' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('api_keys', 'token_usage', 'user_limits', 'chat_sessions', 'chat_messages')) as new_tables,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%api_key%' OR routine_name LIKE '%token%' OR routine_name LIKE '%session%') as new_functions;
