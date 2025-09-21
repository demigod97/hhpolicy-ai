import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserRole, UserRole } from '@/services/authService';

export const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();

  const {
    data: userRole,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getCurrentUserRole();
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;

    // Role hierarchy: board > administrator > executive
    const roleHierarchy: UserRole[] = ['board', 'administrator', 'executive'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const targetRoleIndex = roleHierarchy.indexOf(role);

    // User has role if their role index is <= target role index (higher or equal permission)
    return userRoleIndex !== -1 && targetRoleIndex !== -1 && userRoleIndex <= targetRoleIndex;
  };

  const isAdministrator = (): boolean => {
    return hasRole('administrator');
  };

  const isExecutive = (): boolean => {
    return userRole === 'executive';
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'board';
  };

  return {
    userRole,
    isLoading,
    error,
    refetch,
    hasRole,
    isAdministrator,
    isExecutive,
    isSuperAdmin,
    isAuthenticated: isAuthenticated && !!userRole
  };
};