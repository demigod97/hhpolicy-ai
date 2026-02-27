import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/user';

interface RoleUpdateParams {
  userId: string;
  newRole: string;
}

interface BulkRoleUpdateParams {
  userIds: string[];
  newRole: string;
}

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    setIsLoading(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the get-users Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      // Transform the data to match our User interface
      const users: User[] = result.data?.map((user: {
        id: string;
        email: string;
        name: string;
        role: string;
        created_at: string;
        last_active: string;
        is_active: boolean;
      }) => ({
        id: user.id,
        email: user.email,
        name: user.name || 'Unknown',
        role: user.role as User['role'],
        createdAt: user.created_at,
        lastActive: user.last_active || user.created_at,
        isActive: user.is_active ?? true
      })) || [];

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateUserRole = useCallback(async ({ userId, newRole }: RoleUpdateParams): Promise<{ success: boolean; error?: string }> => {
    setIsOperationLoading(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the assign-user-role Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/assign-user-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          role: newRole,
          action: 'assign'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update user role');
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user role';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsOperationLoading(false);
    }
  }, [toast]);

  const bulkUpdateUserRoles = useCallback(async ({ userIds, newRole }: BulkRoleUpdateParams): Promise<{ success: boolean; error?: string }> => {
    setIsOperationLoading(true);
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the bulk-assign-user-roles Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/bulk-assign-user-roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: userIds,
          role: newRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk update user roles');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to bulk update user roles');
      }

      toast({
        title: 'Success',
        description: result.message,
      });

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update user roles';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsOperationLoading(false);
    }
  }, [toast]);

  return {
    fetchUsers,
    updateUserRole,
    bulkUpdateUserRoles,
    isLoading,
    isOperationLoading
  };
};