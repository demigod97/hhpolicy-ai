-- ============================================================================
-- Migration: Token Usage Tracking System
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.2: Token Usage Tracking (requests, messages, evaluations, timestamps)
-- 
-- This migration creates comprehensive token usage tracking for monitoring
-- user requests, token consumption, message counts, and evaluations.
-- Supports detailed analytics and usage billing.
-- ============================================================================

-- Create token_usage table
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Links to chat session
  notebook_id UUID REFERENCES public.policy_documents(id) ON DELETE SET NULL,
  
  -- Request classification
  request_type TEXT CHECK (request_type IN ('chat', 'upload', 'generation', 'embedding', 'other')),
  endpoint TEXT, -- API endpoint used
  
  -- Token metrics
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Model information
  model_used TEXT, -- e.g., 'gpt-4', 'gpt-3.5-turbo', 'gemini-pro'
  provider TEXT CHECK (provider IN ('openai', 'gemini', 'mistral', 'anthropic', 'system')),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL, -- Which key was used
  
  -- Message tracking
  message_count INTEGER DEFAULT 1,
  evaluation_count INTEGER DEFAULT 0, -- For rating/feedback tracking
  evaluation_score DECIMAL(3,2), -- 0.00 to 5.00 rating
  
  -- Performance metrics
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_timestamp TIMESTAMPTZ,
  duration_ms INTEGER, -- Response time in milliseconds
  
  -- Status tracking
  status TEXT CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message TEXT,
  
  -- Cost tracking (optional, for billing)
  estimated_cost_usd DECIMAL(10,6), -- Estimated cost in USD
  
  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX idx_token_usage_timestamp ON public.token_usage(request_timestamp DESC);
CREATE INDEX idx_token_usage_session ON public.token_usage(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_token_usage_notebook ON public.token_usage(notebook_id) WHERE notebook_id IS NOT NULL;
CREATE INDEX idx_token_usage_provider ON public.token_usage(provider);
CREATE INDEX idx_token_usage_model ON public.token_usage(model_used);
CREATE INDEX idx_token_usage_type ON public.token_usage(request_type);
CREATE INDEX idx_token_usage_status ON public.token_usage(status);
CREATE INDEX idx_token_usage_api_key ON public.token_usage(api_key_id) WHERE api_key_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_token_usage_user_date ON public.token_usage(user_id, request_timestamp DESC);
CREATE INDEX idx_token_usage_user_provider ON public.token_usage(user_id, provider);

-- Enable RLS
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own token usage
CREATE POLICY "users_view_own_token_usage" ON public.token_usage
FOR SELECT
USING (user_id = auth.uid());

-- System can insert token usage (via service role)
CREATE POLICY "system_insert_token_usage" ON public.token_usage
FOR INSERT
WITH CHECK (true); -- Service role handles this

-- Users can update their evaluations
CREATE POLICY "users_update_own_evaluations" ON public.token_usage
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Company operators can view all token usage
CREATE POLICY "company_operators_view_token_usage" ON public.token_usage
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- System owners can manage all token usage
CREATE POLICY "system_owners_manage_token_usage" ON public.token_usage
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Function to calculate duration on insert/update
CREATE OR REPLACE FUNCTION calculate_token_usage_duration()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.response_timestamp IS NOT NULL AND NEW.request_timestamp IS NOT NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.response_timestamp - NEW.request_timestamp)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic duration calculation
CREATE TRIGGER calculate_token_usage_duration_trigger
BEFORE INSERT OR UPDATE ON public.token_usage
FOR EACH ROW
WHEN (NEW.response_timestamp IS NOT NULL)
EXECUTE FUNCTION calculate_token_usage_duration();

-- Function to update API key usage count
CREATE OR REPLACE FUNCTION update_api_key_usage_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.api_key_id IS NOT NULL AND NEW.status = 'success' THEN
    UPDATE public.api_keys
    SET usage_count = usage_count + 1,
        last_used_at = NEW.request_timestamp
    WHERE id = NEW.api_key_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update API key statistics
CREATE TRIGGER update_api_key_usage_count_trigger
AFTER INSERT ON public.token_usage
FOR EACH ROW
WHEN (NEW.api_key_id IS NOT NULL AND NEW.status = 'success')
EXECUTE FUNCTION update_api_key_usage_count();

-- Helper view for daily token usage summary
CREATE OR REPLACE VIEW public.daily_token_usage_summary AS
SELECT 
  user_id,
  DATE(request_timestamp) as usage_date,
  provider,
  request_type,
  COUNT(*) as request_count,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  SUM(total_tokens) as total_tokens,
  SUM(message_count) as total_messages,
  SUM(evaluation_count) as total_evaluations,
  AVG(evaluation_score) as avg_evaluation_score,
  AVG(duration_ms) as avg_duration_ms,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_requests,
  SUM(estimated_cost_usd) as total_estimated_cost
FROM public.token_usage
GROUP BY user_id, DATE(request_timestamp), provider, request_type;

-- Grant access to the view
GRANT SELECT ON public.daily_token_usage_summary TO authenticated;

-- Add comments
COMMENT ON TABLE public.token_usage IS 
'Comprehensive token usage tracking for monitoring, analytics, and billing. Tracks all AI requests, token consumption, and performance metrics.';

COMMENT ON COLUMN public.token_usage.session_id IS 
'Links to chat_sessions table for conversation tracking.';

COMMENT ON COLUMN public.token_usage.evaluation_count IS 
'Number of times user has evaluated/rated this request.';

COMMENT ON COLUMN public.token_usage.evaluation_score IS 
'User rating from 0.00 to 5.00 for this response.';

COMMENT ON COLUMN public.token_usage.estimated_cost_usd IS 
'Estimated cost in USD based on provider pricing. Used for billing projections.';

COMMENT ON VIEW public.daily_token_usage_summary IS 
'Aggregated daily token usage statistics per user, provider, and request type.';

