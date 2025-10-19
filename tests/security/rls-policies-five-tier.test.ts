import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU';

// Test user credentials
const testUsers = {
  systemOwner: {
    email: 'system@test.com',
    password: 'Test123!',
    role: 'system_owner'
  },
  companyOperator: {
    email: 'operator@test.com', 
    password: 'Test123!',
    role: 'company_operator'
  },
  board: {
    email: 'board@test.com',
    password: 'Test123!',
    role: 'board'
  },
  administrator: {
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'administrator'
  },
  executive: {
    email: 'executive@test.com',
    password: 'Test123!',
    role: 'executive'
  }
};

describe('RLS Policies - 5-Tier System', () => {
  let supabase: any;
  const testUserIds: Record<string, string> = {};

  beforeEach(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Create test users and assign roles
    for (const [userType, userData] of Object.entries(testUsers)) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });
      
      if (authError) throw authError;
      
      testUserIds[userType] = authData.user?.id || '';
      
      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserIds[userType],
          role: userData.role
        });
        
      if (roleError) throw roleError;
    }
  });

  afterEach(async () => {
    // Clean up test users
    for (const userId of Object.values(testUserIds)) {
      await supabase.auth.admin.deleteUser(userId);
    }
  });

  describe('Policy Documents Access', () => {
    it('System Owner should have full access to all policy documents', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: documents, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      expect(documents).toBeDefined();
    });

    it('Company Operator should have full access to all policy documents', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: documents, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      expect(documents).toBeDefined();
    });

    it('Board Member should have read-only access to all policy documents', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.board.email,
        password: testUsers.board.password
      });

      const { data: documents, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      expect(documents).toBeDefined();
    });

    it('Administrator should only access their own policy documents', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.administrator.email,
        password: testUsers.administrator.password
      });

      const { data: documents, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      // Should only see documents where user_id matches their own ID
      expect(documents?.every(doc => doc.user_id === testUserIds.administrator)).toBe(true);
    });

    it('Executive should only access their own policy documents', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.executive.email,
        password: testUsers.executive.password
      });

      const { data: documents, error } = await supabase
        .from('policy_documents')
        .select('*');

      expect(error).toBeNull();
      // Should only see documents where user_id matches their own ID
      expect(documents?.every(doc => doc.user_id === testUserIds.executive)).toBe(true);
    });
  });

  describe('Sources Access', () => {
    it('System Owner should have full access to all sources', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: sources, error } = await supabase
        .from('sources')
        .select('*');

      expect(error).toBeNull();
      expect(sources).toBeDefined();
    });

    it('Company Operator should have full access to all sources', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: sources, error } = await supabase
        .from('sources')
        .select('*');

      expect(error).toBeNull();
      expect(sources).toBeDefined();
    });

    it('Board Member should have read-only access to all sources', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.board.email,
        password: testUsers.board.password
      });

      const { data: sources, error } = await supabase
        .from('sources')
        .select('*');

      expect(error).toBeNull();
      expect(sources).toBeDefined();
    });

    it('Administrator should only access administrator sources', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.administrator.email,
        password: testUsers.administrator.password
      });

      const { data: sources, error } = await supabase
        .from('sources')
        .select('*');

      expect(error).toBeNull();
      // Should only see sources with target_role = 'administrator' or NULL
      expect(sources?.every(source => 
        source.target_role === 'administrator' || source.target_role === null
      )).toBe(true);
    });

    it('Executive should only access executive and administrator sources', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.executive.email,
        password: testUsers.executive.password
      });

      const { data: sources, error } = await supabase
        .from('sources')
        .select('*');

      expect(error).toBeNull();
      // Should only see sources with target_role = 'executive', 'administrator', or NULL
      expect(sources?.every(source => 
        ['executive', 'administrator', null].includes(source.target_role)
      )).toBe(true);
    });
  });

  describe('User Roles Management', () => {
    it('System Owner should be able to assign any role', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      // Try to assign system_owner role (should succeed)
      const { error: systemOwnerError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserIds.administrator,
          role: 'system_owner'
        });

      expect(systemOwnerError).toBeNull();
    });

    it('Company Operator should not be able to assign system_owner role', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      // Try to assign system_owner role (should fail)
      const { error: systemOwnerError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserIds.administrator,
          role: 'system_owner'
        });

      expect(systemOwnerError).not.toBeNull();
    });

    it('Company Operator should be able to assign other roles', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      // Try to assign company_operator role (should succeed)
      const { error: operatorError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserIds.administrator,
          role: 'company_operator'
        });

      expect(operatorError).toBeNull();
    });

    it('Lower roles should not be able to assign roles', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.administrator.email,
        password: testUsers.administrator.password
      });

      // Try to assign any role (should fail)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserIds.executive,
          role: 'administrator'
        });

      expect(roleError).not.toBeNull();
    });
  });

  describe('API Keys Access', () => {
    it('System Owner should have full access to all API keys', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('*');

      expect(error).toBeNull();
      expect(apiKeys).toBeDefined();
    });

    it('Company Operator should have full access to all API keys', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('*');

      expect(error).toBeNull();
      expect(apiKeys).toBeDefined();
    });

    it('Other roles should not have access to API keys', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.board.email,
        password: testUsers.board.password
      });

      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('*');

      expect(error).not.toBeNull();
    });
  });

  describe('Token Usage Access', () => {
    it('System Owner should have full access to all token usage', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: tokenUsage, error } = await supabase
        .from('token_usage')
        .select('*');

      expect(error).toBeNull();
      expect(tokenUsage).toBeDefined();
    });

    it('Company Operator should have access to company token usage', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: tokenUsage, error } = await supabase
        .from('token_usage')
        .select('*');

      expect(error).toBeNull();
      expect(tokenUsage).toBeDefined();
    });

    it('Users should only see their own token usage', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.administrator.email,
        password: testUsers.administrator.password
      });

      const { data: tokenUsage, error } = await supabase
        .from('token_usage')
        .select('*');

      expect(error).toBeNull();
      // Should only see their own usage
      expect(tokenUsage?.every(usage => usage.user_id === testUserIds.administrator)).toBe(true);
    });
  });

  describe('User Limits Access', () => {
    it('System Owner should have full access to all user limits', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: userLimits, error } = await supabase
        .from('user_limits')
        .select('*');

      expect(error).toBeNull();
      expect(userLimits).toBeDefined();
    });

    it('Company Operator should have read access to user limits', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: userLimits, error } = await supabase
        .from('user_limits')
        .select('*');

      expect(error).toBeNull();
      expect(userLimits).toBeDefined();
    });

    it('Other roles should not have access to user limits', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.board.email,
        password: testUsers.board.password
      });

      const { data: userLimits, error } = await supabase
        .from('user_limits')
        .select('*');

      expect(error).not.toBeNull();
    });
  });

  describe('Chat Sessions Access', () => {
    it('System Owner should have access to all chat sessions', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.systemOwner.email,
        password: testUsers.systemOwner.password
      });

      const { data: chatSessions, error } = await supabase
        .from('chat_sessions')
        .select('*');

      expect(error).toBeNull();
      expect(chatSessions).toBeDefined();
    });

    it('Company Operator should have access to all chat sessions', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.companyOperator.email,
        password: testUsers.companyOperator.password
      });

      const { data: chatSessions, error } = await supabase
        .from('chat_sessions')
        .select('*');

      expect(error).toBeNull();
      expect(chatSessions).toBeDefined();
    });

    it('Users should only see their own chat sessions', async () => {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.administrator.email,
        password: testUsers.administrator.password
      });

      const { data: chatSessions, error } = await supabase
        .from('chat_sessions')
        .select('*');

      expect(error).toBeNull();
      // Should only see their own sessions
      expect(chatSessions?.every(session => session.user_id === testUserIds.administrator)).toBe(true);
    });
  });
});
