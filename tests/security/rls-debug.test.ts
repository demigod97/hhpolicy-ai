import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = 'https://vnmsyofypuhxjlzwnuhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubXN5b2Z5cHVoeGpsendudWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzQxNjAsImV4cCI6MjA3MzE1MDE2MH0.7HPPem9o3-uaT_f6VKDQdMhDShy7ZcR_prJGdO71aKU';

describe('RLS Debug - Check Actual Responses', () => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  it('should debug policy_documents access', async () => {
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*')
      .limit(1);

    console.log('Policy Documents Response:');
    console.log('Data:', data);
    console.log('Error:', error);
    console.log('Error message:', error?.message);
    console.log('Error code:', error?.code);
    console.log('Error details:', error?.details);
    console.log('Error hint:', error?.hint);

    // For now, just log the response to understand what's happening
    expect(true).toBe(true);
  });

  it('should debug sources access', async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .limit(1);

    console.log('Sources Response:');
    console.log('Data:', data);
    console.log('Error:', error);

    expect(true).toBe(true);
  });

  it('should debug user_roles access', async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    console.log('User Roles Response:');
    console.log('Data:', data);
    console.log('Error:', error);

    expect(true).toBe(true);
  });
});
