-- ============================================================================
-- Migration: API Key Management System
-- Epic 1.7: SaaS Infrastructure
-- Story 1.7.1: API Key Management (storage, encryption, UI)
-- 
-- This migration creates the api_keys table for storing encrypted API keys
-- from providers like OpenAI, Gemini, and Mistral. Keys are encrypted using
-- AES-256 encryption with a separate encryption key stored in environment.
-- ============================================================================

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID, -- For company-wide keys (future use)
  
  -- Provider information
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'mistral', 'anthropic')),
  key_name TEXT NOT NULL,
  
  -- Encrypted key storage
  encrypted_key TEXT NOT NULL, -- AES-256 encrypted API key
  key_hash TEXT NOT NULL, -- SHA-256 hash for verification without decryption
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Only one default key per provider per user
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(user_id, provider, key_name),
  CHECK (encrypted_key != ''),
  CHECK (key_hash != '')
);

-- Create indexes for performance
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_default ON public.api_keys(user_id, provider, is_default) WHERE is_default = true;
CREATE INDEX idx_api_keys_organization ON public.api_keys(organization_id) WHERE organization_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own API keys
CREATE POLICY "users_view_own_api_keys" ON public.api_keys
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own API keys
CREATE POLICY "users_insert_own_api_keys" ON public.api_keys
FOR INSERT
WITH CHECK (user_id = auth.uid() AND created_by = auth.uid());

-- Users can update their own API keys
CREATE POLICY "users_update_own_api_keys" ON public.api_keys
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own API keys
CREATE POLICY "users_delete_own_api_keys" ON public.api_keys
FOR DELETE
USING (user_id = auth.uid());

-- Company operators can view all API keys
CREATE POLICY "company_operators_view_api_keys" ON public.api_keys
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- Company operators can manage organization-wide API keys
CREATE POLICY "company_operators_manage_org_api_keys" ON public.api_keys
FOR ALL
USING (
  organization_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
)
WITH CHECK (
  organization_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('company_operator', 'system_owner')
  )
);

-- System owners have full access
CREATE POLICY "system_owners_full_access_api_keys" ON public.api_keys
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'system_owner'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at_trigger
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION update_api_keys_updated_at();

-- Function to ensure only one default key per provider per user
CREATE OR REPLACE FUNCTION ensure_single_default_api_key()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset other default keys for this user/provider combination
    UPDATE public.api_keys
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND provider = NEW.provider
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for default key enforcement
CREATE TRIGGER ensure_single_default_api_key_trigger
BEFORE INSERT OR UPDATE ON public.api_keys
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION ensure_single_default_api_key();

-- Add comments
COMMENT ON TABLE public.api_keys IS 
'Stores encrypted API keys for AI providers. Keys are AES-256 encrypted with hash for verification.';

COMMENT ON COLUMN public.api_keys.encrypted_key IS 
'AES-256 encrypted API key. Never expose in frontend.';

COMMENT ON COLUMN public.api_keys.key_hash IS 
'SHA-256 hash of the API key for verification without decryption.';

COMMENT ON COLUMN public.api_keys.organization_id IS 
'For company-wide keys managed by company operators. NULL for personal keys.';

