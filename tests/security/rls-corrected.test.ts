import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU';

describe('RLS Policies - Corrected Verification', () => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  describe('Unauthenticated Access', () => {
    it('should return empty array for policy_documents (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for sources (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for user_roles (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for api_keys (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for token_usage (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('token_usage')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for user_limits (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('user_limits')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for chat_sessions (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for chat_messages (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for notes (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('should return empty array for documents (RLS filtering)', async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('RLS Policy Structure', () => {
    it('should verify that RLS is working by returning empty arrays', async () => {
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

        expect(error).toBeNull();
        expect(data).toEqual([]);
      }
    });

    it('should verify that RLS policies are active and filtering data', async () => {
      // This test confirms that RLS is working by ensuring we get empty arrays
      // instead of actual data, which means the policies are filtering correctly
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Security Verification', () => {
    it('should confirm that unauthenticated users cannot see any data', async () => {
      // Test multiple tables to ensure RLS is consistently applied
      const testPromises = [
        supabase.from('policy_documents').select('*'),
        supabase.from('sources').select('*'),
        supabase.from('user_roles').select('*'),
        supabase.from('api_keys').select('*'),
        supabase.from('token_usage').select('*'),
        supabase.from('user_limits').select('*'),
        supabase.from('chat_sessions').select('*'),
        supabase.from('chat_messages').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('documents').select('*')
      ];

      const results = await Promise.all(testPromises);

      // All queries should return empty arrays due to RLS filtering
      results.forEach(({ data, error }, index) => {
        expect(error).toBeNull();
        expect(data).toEqual([]);
      });
    });
  });
});
