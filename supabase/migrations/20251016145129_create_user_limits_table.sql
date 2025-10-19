-- ============================================================================
-- Migration: User Limits and Quota Management
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.3: Usage Dashboard & Monitoring UI
-- Story 1.7.4: User Limits & Quota Management
-- 
-- This migration creates the user_limits table for managing token quotas,
-- request limits, and automatic reset functionality. System owners can
-- configure per-user limits and overrides.
-- ============================================================================

-- Create user_limits table
CREATE TABLE IF NOT EXISTS public.user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Token limits
  daily_token_limit INTEGER DEFAULT 100000, -- 100K tokens per day
  monthly_token_limit INTEGER DEFAULT 1000000, -- 1M tokens per month
  
  -- Request limits
  daily_request_limit INTEGER DEFAULT 100,
  monthly_request_limit INTEGER DEFAULT 1000,
  
  -- Current usage (automatically updated)
  current_daily_tokens INTEGER DEFAULT 0,
  current_monthly_tokens INTEGER DEFAULT 0,
  current_daily_requests INTEGER DEFAULT 0,
  current_monthly_requests INTEGER DEFAULT 0,
  
  -- Reset timestamps
  daily_reset_at TIMESTAMPTZ DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  monthly_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
  
  -- Special configurations
  is_unlimited BOOLEAN DEFAULT false, -- Bypass all limits
  is_suspended BOOLEAN DEFAULT false, -- Temporarily suspend user
  
  -- Limit overrides (flexible custom limits)
  limit_overrides JSONB DEFAULT '{}'::jsonb,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_user_limits_user_id ON public.user_limits(user_id);
CREATE INDEX idx_user_limits_unlimited ON public.user_limits(is_unlimited) WHERE is_unlimited = true;
CREATE INDEX idx_user_limits_suspended ON public.user_limits(is_suspended) WHERE is_suspended = true;
CREATE INDEX idx_user_limits_daily_reset ON public.user_limits(daily_reset_at);
CREATE INDEX idx_user_limits_monthly_reset ON public.user_limits(monthly_reset_at);

-- Enable RLS
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own limits
CREATE POLICY "users_view_own_limits" ON public.user_limits
FOR SELECT
USING (user_id = auth.uid());

-- System owners can view all limits
CREATE POLICY "system_owners_view_all_limits" ON public.user_limits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Company operators can view limits (read-only)
CREATE POLICY "company_operators_view_limits" ON public.user_limits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- System owners can create limits
CREATE POLICY "system_owners_create_limits" ON public.user_limits
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- System owners can update limits
CREATE POLICY "system_owners_update_limits" ON public.user_limits
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- System owners can delete limits
CREATE POLICY "system_owners_delete_limits" ON public.user_limits
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_limits_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_user_limits_updated_at_trigger
BEFORE UPDATE ON public.user_limits
FOR EACH ROW
EXECUTE FUNCTION update_user_limits_updated_at();

-- Function to create default limits for new users
CREATE OR REPLACE FUNCTION create_default_user_limits()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create limits for new users
CREATE TRIGGER create_default_user_limits_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_user_limits();

-- Function to check if user is within limits
CREATE OR REPLACE FUNCTION check_user_limits(
  p_user_id UUID,
  p_tokens_to_add INTEGER DEFAULT 0,
  p_request_to_add INTEGER DEFAULT 1
)
RETURNS TABLE(
  within_limits BOOLEAN,
  reason TEXT,
  daily_tokens_remaining INTEGER,
  monthly_tokens_remaining INTEGER,
  daily_requests_remaining INTEGER,
  monthly_requests_remaining INTEGER
)
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_limits RECORD;
BEGIN
  -- Get user limits
  SELECT * INTO v_limits
  FROM public.user_limits
  WHERE user_id = p_user_id;
  
  -- If no limits record, return denied
  IF v_limits IS NULL THEN
    RETURN QUERY SELECT false, 'No limits configured for user', 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- If unlimited, return allowed
  IF v_limits.is_unlimited THEN
    RETURN QUERY SELECT true, 'Unlimited access', -1, -1, -1, -1;
    RETURN;
  END IF;
  
  -- If suspended, return denied
  IF v_limits.is_suspended THEN
    RETURN QUERY SELECT false, 'User account suspended', 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Check daily token limit
  IF (v_limits.current_daily_tokens + p_tokens_to_add) > v_limits.daily_token_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Daily token limit exceeded',
      0,
      v_limits.monthly_token_limit - v_limits.current_monthly_tokens,
      v_limits.daily_request_limit - v_limits.current_daily_requests,
      v_limits.monthly_request_limit - v_limits.current_monthly_requests;
    RETURN;
  END IF;
  
  -- Check monthly token limit
  IF (v_limits.current_monthly_tokens + p_tokens_to_add) > v_limits.monthly_token_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Monthly token limit exceeded',
      v_limits.daily_token_limit - v_limits.current_daily_tokens,
      0,
      v_limits.daily_request_limit - v_limits.current_daily_requests,
      v_limits.monthly_request_limit - v_limits.current_monthly_requests;
    RETURN;
  END IF;
  
  -- Check daily request limit
  IF (v_limits.current_daily_requests + p_request_to_add) > v_limits.daily_request_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Daily request limit exceeded',
      v_limits.daily_token_limit - v_limits.current_daily_tokens,
      v_limits.monthly_token_limit - v_limits.current_monthly_tokens,
      0,
      v_limits.monthly_request_limit - v_limits.current_monthly_requests;
    RETURN;
  END IF;
  
  -- Check monthly request limit
  IF (v_limits.current_monthly_requests + p_request_to_add) > v_limits.monthly_request_limit THEN
    RETURN QUERY SELECT 
      false, 
      'Monthly request limit exceeded',
      v_limits.daily_token_limit - v_limits.current_daily_tokens,
      v_limits.monthly_token_limit - v_limits.current_monthly_tokens,
      v_limits.daily_request_limit - v_limits.current_daily_requests,
      0;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true, 
    'Within limits',
    v_limits.daily_token_limit - (v_limits.current_daily_tokens + p_tokens_to_add),
    v_limits.monthly_token_limit - (v_limits.current_monthly_tokens + p_tokens_to_add),
    v_limits.daily_request_limit - (v_limits.current_daily_requests + p_request_to_add),
    v_limits.monthly_request_limit - (v_limits.current_monthly_requests + p_request_to_add);
END;
$$ LANGUAGE plpgsql;

-- Function to update usage counters
CREATE OR REPLACE FUNCTION update_user_usage(
  p_user_id UUID,
  p_tokens INTEGER,
  p_requests INTEGER DEFAULT 1
)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_limits
  SET 
    current_daily_tokens = current_daily_tokens + p_tokens,
    current_monthly_tokens = current_monthly_tokens + p_tokens,
    current_daily_requests = current_daily_requests + p_requests,
    current_monthly_requests = current_monthly_requests + p_requests
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily limits (run daily via cron)
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_limits
  SET 
    current_daily_tokens = 0,
    current_daily_requests = 0,
    daily_reset_at = CURRENT_DATE + INTERVAL '1 day'
  WHERE daily_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly limits (run monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_limits
  SET 
    current_monthly_tokens = 0,
    current_monthly_requests = 0,
    monthly_reset_at = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  WHERE monthly_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.user_limits IS 
'User token and request quotas with automatic reset functionality. System owners can configure per-user limits.';

COMMENT ON FUNCTION check_user_limits IS 
'Check if user is within their usage limits before processing a request.';

COMMENT ON FUNCTION update_user_usage IS 
'Update user usage counters after a successful request.';

COMMENT ON FUNCTION reset_daily_limits IS 
'Reset daily usage counters. Should be run daily via cron job.';

COMMENT ON FUNCTION reset_monthly_limits IS 
'Reset monthly usage counters. Should be run monthly via cron job.';

