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
      // Call the get-users Edge Function via Supabase client (handles CORS)
      const { data: result, error: invokeError } = await supabase.functions.invoke('get-users', {
        method: 'GET',
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to fetch users');
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to fetch users');
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
      // Call the assign-user-role Edge Function via Supabase client (handles CORS)
      const { data: result, error: invokeError } = await supabase.functions.invoke('assign-user-role', {
        body: {
          user_id: userId,
          role: newRole,
          action: 'assign'
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to update user role');
      }

      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update user role');
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
      // Call the bulk-assign-user-roles Edge Function via Supabase client (handles CORS)
      const { data: result, error: invokeError } = await supabase.functions.invoke('bulk-assign-user-roles', {
        body: {
          user_ids: userIds,
          role: newRole
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to bulk update user roles');
      }

      if (!result?.success) {
        throw new Error(result?.message || 'Failed to bulk update user roles');
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