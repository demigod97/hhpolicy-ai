import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU';

describe('RLS Policies - Basic Verification', () => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  describe('Unauthenticated Access', () => {
    it('should block unauthenticated access to policy_documents', async () => {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to sources', async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to user_roles', async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to api_keys', async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to token_usage', async () => {
      const { data, error } = await supabase
        .from('token_usage')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to user_limits', async () => {
      const { data, error } = await supabase
        .from('user_limits')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to chat_sessions', async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to chat_messages', async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to notes', async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('should block unauthenticated access to documents', async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .limit(1);

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('RLS Policy Structure', () => {
    it('should have proper error messages for RLS violations', async () => {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).not.toBeNull();
      expect(error?.message).toContain('permission denied');
    });

    it('should verify that all tables are protected', async () => {
      const tables = [
        'policy_documents',
        'sources',
        'user_roles',
        'api_keys',
        'token_usage',
        'user_limits',
        'chat_sessions',
        'chat_messages',
        'notes',
        'documents'
      ];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        expect(error).not.toBeNull();
        expect(data).toBeNull();
      }
    });
  });
});
