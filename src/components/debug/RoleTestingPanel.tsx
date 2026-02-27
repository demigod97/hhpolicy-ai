import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRolePermissions, UserRole, ROLE_HIERARCHY } from '@/hooks/useRolePermissions';
import { RoleIndicator, RoleDescription } from '@/components/navigation/RoleIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const ALL_ROLES: UserRole[] = ['executive', 'board', 'administrator', 'company_operator', 'system_owner'];

export const RoleTestingPanel: React.FC = () => {
  const { user } = useAuth();
  const { userRole, permissions, isLoading, roleHierarchyLevel } = useRolePermissions();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  const handleRoleChange = async () => {
    if (!selectedRole || !user?.id) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      // First, check if a role exists for this user
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" - which is okay
        throw fetchError;
      }

      let result;
      if (existingRole) {
        // Update existing role
        result = await supabase
          .from('user_roles')
          .update({ role: selectedRole, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .select();
      } else {
        // Insert new role
        result = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: selectedRole })
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      // Invalidate the user role query to refetch
      await queryClient.invalidateQueries({ queryKey: ['userRole', user.id] });

      setUpdateMessage({
        type: 'success',
        message: `Successfully changed role to ${selectedRole}`,
      });

      // Clear selection
      setSelectedRole('');
    } catch (error) {
      console.error('Error updating role:', error);
      setUpdateMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update role',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const permissionEntries = Object.entries(permissions) as [keyof typeof permissions, boolean][];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">🧪 Role Testing Panel</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Test role-based navigation and permissions. Change your role and observe how the UI adapts.
        </p>

        {/* Current Role Display */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Current Role</h3>
          {isLoading ? (
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-center gap-3">
              <RoleIndicator />
              <span className="text-sm text-muted-foreground">
                Hierarchy Level: {roleHierarchyLevel}
              </span>
            </div>
          )}
        </div>

        {/* Role Changer */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Change Role (Test Only)</h3>
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleRoleChange}
              disabled={!selectedRole || isUpdating || selectedRole === userRole}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Role'
              )}
            </Button>
          </div>

          {updateMessage && (
            <Alert
              variant={updateMessage.type === 'error' ? 'destructive' : 'default'}
              className="mt-3"
            >
              {updateMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{updateMessage.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Current Role Description */}
        {userRole && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Role Information</h3>
            <RoleDescription />
          </div>
        )}

        {/* Permissions Matrix */}
        <div>
          <h3 className="text-sm font-medium mb-2">Current Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissionEntries.map(([permission, hasAccess]) => (
              <div
                key={permission}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <span className="text-xs">
                  {permission.replace('canAccess', '').replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant={hasAccess ? 'default' : 'outline'}>
                  {hasAccess ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* All Roles Reference */}
      <Card className="p-6">
        <h3 className="text-sm font-medium mb-3">Role Hierarchy Reference</h3>
        <div className="space-y-2">
          {ALL_ROLES.map((role) => (
            <div
              key={role}
              className={`flex items-center justify-between p-3 rounded border ${
                role === userRole ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div>
                <span className="text-sm font-medium">
                  {role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                {role === userRole && (
                  <Badge variant="default" className="ml-2">
                    Current
                  </Badge>
                )}
              </div>
              <Badge variant="outline">Level {ROLE_HIERARCHY[role]}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
