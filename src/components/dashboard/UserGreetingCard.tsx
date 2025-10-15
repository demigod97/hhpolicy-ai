import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useGlobalSourcesCount } from '@/hooks/useGlobalSourcesCount';

const UserGreetingCard = () => {
  const { user } = useAuth();
  const { userRole, isLoading: roleLoading, error } = useUserRole();
  const { globalSourcesCount, sourcesDescription, isLoading: sourcesLoading } = useGlobalSourcesCount();

  // Debug logging
  React.useEffect(() => {
    console.log('UserGreetingCard Debug:', {
      userId: user?.id,
      email: user?.email,
      userRole,
      roleLoading,
      error
    });
  }, [user?.id, user?.email, userRole, roleLoading, error]);

  if (!user) return null;

  // Get user's display name (fallback to email username if no full name)
  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User';

  // Format role for display
  const formatRole = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Administrator';
      case 'executive':
        return 'Executive';
      case 'board':
        return 'Board';
      default:
        return 'User';
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'executive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'board':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-blue-100 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          Welcome back, {displayName}!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Role:</span>
          {roleLoading ? (
            <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <Badge 
              variant="outline" 
              className={getRoleColor(userRole || '')}
            >
              {userRole ? formatRole(userRole) : 'No Role Assigned'}
            </Badge>
          )}
        </div>

        <div className="flex items-start gap-2 pt-1">
          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm text-gray-600">Available Sources:</span>
            {sourcesLoading ? (
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-sm text-gray-700 mt-0.5">{sourcesDescription}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGreetingCard;