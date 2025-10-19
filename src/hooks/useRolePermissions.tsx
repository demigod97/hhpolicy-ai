import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY = {
  executive: 1,
  board: 2,
  administrator: 3,
  company_operator: 4,
  system_owner: 5,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

// Navigation permissions by role
export const NAVIGATION_PERMISSIONS = {
  executive: {
    canAccessDashboard: true,
    canAccessDocuments: true,
    canAccessChat: true,
    canAccessSearch: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canAccessUserManagement: false,
    canAccessAPIKeys: false,
    canAccessTokenDashboard: false,
    canAccessSystemSettings: false,
    canAccessUserLimits: false,
    canAccessAnalytics: false,
  },
  board: {
    canAccessDashboard: true,
    canAccessDocuments: true,
    canAccessChat: true,
    canAccessSearch: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canAccessUserManagement: false,
    canAccessAPIKeys: false,
    canAccessTokenDashboard: false,
    canAccessSystemSettings: false,
    canAccessUserLimits: false,
    canAccessAnalytics: true,
  },
  administrator: {
    canAccessDashboard: true,
    canAccessDocuments: true,
    canAccessChat: true,
    canAccessSearch: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canAccessUserManagement: false,
    canAccessAPIKeys: false,
    canAccessTokenDashboard: false,
    canAccessSystemSettings: false,
    canAccessUserLimits: false,
    canAccessAnalytics: true,
  },
  company_operator: {
    canAccessDashboard: true,
    canAccessDocuments: true,
    canAccessChat: true,
    canAccessSearch: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canAccessUserManagement: true,
    canAccessAPIKeys: true,
    canAccessTokenDashboard: true,
    canAccessSystemSettings: false,
    canAccessUserLimits: false,
    canAccessAnalytics: true,
  },
  system_owner: {
    canAccessDashboard: true,
    canAccessDocuments: true,
    canAccessChat: true,
    canAccessSearch: true,
    canAccessSettings: true,
    canAccessHelp: true,
    canAccessUserManagement: true,
    canAccessAPIKeys: true,
    canAccessTokenDashboard: true,
    canAccessSystemSettings: true,
    canAccessUserLimits: true,
    canAccessAnalytics: true,
  },
};

export type NavigationPermissions = typeof NAVIGATION_PERMISSIONS[UserRole];

interface UserRoleData {
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export const useRolePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  // Fetch user role from database
  const { data: roleData, isLoading, error } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('No user ID available');
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, created_at, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      return data as UserRoleData;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const userRole = roleData?.role as UserRole | undefined;

  // Calculate permissions based on role
  const permissions = useMemo(() => {
    if (!userRole) {
      return NAVIGATION_PERMISSIONS.executive; // Default to minimal permissions
    }
    return NAVIGATION_PERMISSIONS[userRole];
  }, [userRole]);

  // Helper function to check if user has specific permission
  const hasPermission = (permission: keyof NavigationPermissions): boolean => {
    return permissions[permission] ?? false;
  };

  // Helper function to check if user has a specific role or higher
  const hasRoleOrHigher = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  };

  // Helper function to check if user has exactly a specific role
  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  return {
    userRole,
    permissions,
    hasPermission,
    hasRole,
    hasRoleOrHigher,
    isLoading,
    error: error?.message,
    roleHierarchyLevel: userRole ? ROLE_HIERARCHY[userRole] : 0,
  };
};
