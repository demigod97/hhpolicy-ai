// Test RLS Policies for 5-Tier System
// This script tests the current RLS policies to ensure they work correctly

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSPolicies() {
  console.log('Testing RLS Policies for 5-Tier System...\n');

  try {
    // Test 1: Check if we can access policy_documents with current policies
    console.log('1. Testing policy_documents access...');
    const { data: policyDocs, error: policyError } = await supabase
      .from('policy_documents')
      .select('*')
      .limit(5);

    if (policyError) {
      console.log('❌ Error accessing policy_documents:', policyError.message);
    } else {
      console.log('✅ Successfully accessed policy_documents:', policyDocs?.length || 0, 'documents');
    }

    // Test 2: Check if we can access sources with current policies
    console.log('\n2. Testing sources access...');
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .limit(5);

    if (sourcesError) {
      console.log('❌ Error accessing sources:', sourcesError.message);
    } else {
      console.log('✅ Successfully accessed sources:', sources?.length || 0, 'sources');
    }

    // Test 3: Check if we can access user_roles
    console.log('\n3. Testing user_roles access...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);

    if (rolesError) {
      console.log('❌ Error accessing user_roles:', rolesError.message);
    } else {
      console.log('✅ Successfully accessed user_roles:', userRoles?.length || 0, 'roles');
    }

    // Test 4: Check if we can access api_keys
    console.log('\n4. Testing api_keys access...');
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('*')
      .limit(5);

    if (apiKeysError) {
      console.log('❌ Error accessing api_keys:', apiKeysError.message);
    } else {
      console.log('✅ Successfully accessed api_keys:', apiKeys?.length || 0, 'keys');
    }

    // Test 5: Check if we can access token_usage
    console.log('\n5. Testing token_usage access...');
    const { data: tokenUsage, error: tokenError } = await supabase
      .from('token_usage')
      .select('*')
      .limit(5);

    if (tokenError) {
      console.log('❌ Error accessing token_usage:', tokenError.message);
    } else {
      console.log('✅ Successfully accessed token_usage:', tokenUsage?.length || 0, 'records');
    }

    // Test 6: Check if we can access user_limits
    console.log('\n6. Testing user_limits access...');
    const { data: userLimits, error: limitsError } = await supabase
      .from('user_limits')
      .select('*')
      .limit(5);

    if (limitsError) {
      console.log('❌ Error accessing user_limits:', limitsError.message);
    } else {
      console.log('✅ Successfully accessed user_limits:', userLimits?.length || 0, 'limits');
    }

    // Test 7: Check if we can access chat_sessions
    console.log('\n7. Testing chat_sessions access...');
    const { data: chatSessions, error: chatError } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(5);

    if (chatError) {
      console.log('❌ Error accessing chat_sessions:', chatError.message);
    } else {
      console.log('✅ Successfully accessed chat_sessions:', chatSessions?.length || 0, 'sessions');
    }

    // Test 8: Check if we can access chat_messages
    console.log('\n8. Testing chat_messages access...');
    const { data: chatMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5);

    if (messagesError) {
      console.log('❌ Error accessing chat_messages:', messagesError.message);
    } else {
      console.log('✅ Successfully accessed chat_messages:', chatMessages?.length || 0, 'messages');
    }

    console.log('\n🎉 RLS Policy testing completed!');
    console.log('\nNote: Some tables may be empty or have restricted access based on current RLS policies.');
    console.log('This is expected behavior for a properly secured system.');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Run the test
testRLSPolicies();
