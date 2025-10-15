
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Types for role management
export type UserRole = 'administrator' | 'executive' | 'board';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AssignRoleRequest {
  user_id: string;
  role: UserRole;
  action: 'assign' | 'revoke';
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  data?: UserRoleData;
  error?: string;
}

export const useLogout = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      
      // Redirect to auth page
      navigate('/auth', { replace: true });
      
    } catch (error: unknown) {
      console.error('Logout error:', error);
      
      // Even if there's an error, redirect to auth page
      toast({
        title: "Signed out",
        description: "You have been signed out locally.",
        variant: "default"
      });
      
      navigate('/auth', { replace: true });
    }
  };

  return { logout };
};

// Role Management Service Functions

/**
 * Assign or revoke a role for a user (Super Admin only)
 */
export const assignUserRole = async (request: AssignRoleRequest): Promise<AssignRoleResponse> => {
  try {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) {
      throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('assign-user-role', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
};

/**
 * Get user roles for a specific user
 */
export const getUserRoles = async (userId?: string): Promise<UserRoleData[]> => {
  try {
    const query = supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

/**
 * Check if current user has a specific role
 */
export const hasRole = async (role: UserRole): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', role)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Check if current user is board member
 */
export const isSuperAdmin = async (): Promise<boolean> => {
  return hasRole('board');
};

/**
 * Get current user's highest priority role
 */
export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  try {
    // First, ensure we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.log('getCurrentUserRole: No valid session found');
      return null;
    }

    const user = sessionData.session.user;
    console.log('getCurrentUserRole: User ID:', user.id, 'Email:', user.email);

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getCurrentUserRole: Database error:', error);
      throw error;
    }

    console.log('getCurrentUserRole: Query result:', data);

    if (!data || data.length === 0) {
      console.log('getCurrentUserRole: No roles found for user');
      return null;
    }

    // Return highest priority role (board > administrator > executive)
    const roleHierarchy: UserRole[] = ['board', 'administrator', 'executive'];

    for (const role of roleHierarchy) {
      if (data.some(r => r.role === role)) {
        return role;
      }
    }

    return data[0].role as UserRole;
  } catch (error) {
    console.error('Error getting current user role:', error);
    return null;
  }
};

// React hooks for role management

/**
 * Hook for role assignment operations
 */
export const useRoleAssignment = () => {
  const { toast } = useToast();

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const response = await assignUserRole({
        user_id: userId,
        role,
        action: 'assign',
      });

      if (response.success) {
        toast({
          title: 'Role Assigned',
          description: response.message,
        });
        return response;
      } else {
        toast({
          title: 'Assignment Failed',
          description: response.message,
          variant: 'destructive',
        });
        throw new Error(response.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign role';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const revokeRole = async (userId: string, role: UserRole) => {
    try {
      const response = await assignUserRole({
        user_id: userId,
        role,
        action: 'revoke',
      });

      if (response.success) {
        toast({
          title: 'Role Revoked',
          description: response.message,
        });
        return response;
      } else {
        toast({
          title: 'Revocation Failed',
          description: response.message,
          variant: 'destructive',
        });
        throw new Error(response.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke role';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { assignRole, revokeRole };
};
