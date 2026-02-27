import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserDebugInfo {
  authUser?: unknown;
  dbUser?: unknown;
  error?: string;
}

const UserRoleDebug: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user exists in users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          setUserInfo({
            authUser: user,
            dbUser: userData,
            error: error?.message
          });
        }
      } catch (error) {
        setUserInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const setSystemOwnerRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            role: 'system_owner',
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            is_active: true
          });

        if (error) {
          console.error('Error setting role:', error);
        } else {
          console.log('Role set successfully');
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>User Role Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Auth User:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo?.authUser, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Database User:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(userInfo?.dbUser, null, 2)}
            </pre>
          </div>

          {userInfo?.error && (
            <div>
              <h3 className="font-semibold text-red-600">Error:</h3>
              <p className="text-red-600">{userInfo.error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={setSystemOwnerRole} className="bg-blue-600 hover:bg-blue-700">
              Set System Owner Role
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleDebug;
