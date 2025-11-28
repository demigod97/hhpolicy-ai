import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest, UserRoleType } from '@/types/userProfile';

/**
 * Fetch current user profile including email, full_name, and role
 */
export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile> => {
      if (!user?.id) throw new Error('Not authenticated');

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        throw roleError;
      }

      return {
        id: user.id,
        email: profile?.email || user.email || '',
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url,
        role: (roleData?.role as UserRoleType) || 'administrator',
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || '',
      };
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Update user's display name (full_name in profiles table)
 */
export function useUpdateDisplayName() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: request.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'Display name updated',
        description: 'Your display name has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update display name.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Change user password via Supabase Auth
 */
export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: ChangePasswordRequest) => {
      const { error } = await supabase.auth.updateUser({
        password: request.newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Password change failed',
        description: error.message || 'Failed to change password.',
        variant: 'destructive',
      });
    },
  });
}
