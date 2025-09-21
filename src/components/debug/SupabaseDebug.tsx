import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SupabaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
        
        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Session data:', sessionData);
        console.log('Session error:', sessionError);
        
        // Test a simple query
        const { data: testData, error: testError } = await supabase
          .from('user_roles')
          .select('count')
          .limit(1);
          
        console.log('Test query data:', testData);
        console.log('Test query error:', testError);
        
        setDebugInfo({
          supabaseUrl: supabaseUrl || 'Missing',
          supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing',
          session: sessionData?.session ? 'Valid' : 'Missing',
          sessionError: sessionError?.message || 'None',
          testQueryError: testError?.message || 'None'
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: (error as Error).message });
      }
    };
    
    checkSupabaseConfig();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Supabase Debug Info:</h3>
      <pre className="text-sm">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default SupabaseDebug;