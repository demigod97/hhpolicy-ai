import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useRolePermissions, UserRole } from './useRolePermissions';

export interface NavigationState {
  from?: string;
  message?: string;
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, hasPermission } = useRolePermissions();

  // Navigate with permission check
  const navigateTo = useCallback(
    (path: string, state?: NavigationState) => {
      navigate(path, { state });
    },
    [navigate]
  );

  // Navigate back with fallback
  const navigateBack = useCallback(
    (fallbackPath: string = '/') => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    },
    [navigate]
  );

  // Get role-specific home route
  const getRoleHomeRoute = useCallback((role?: UserRole): string => {
    if (!role) return '/';

    switch (role) {
      case 'system_owner':
      case 'company_operator':
        return '/admin';
      case 'board':
        return '/board/overview';
      case 'administrator':
        return '/admin/documents';
      case 'executive':
      default:
        return '/';
    }
  }, []);

  // Navigate to role home
  const navigateToRoleHome = useCallback(() => {
    const homeRoute = getRoleHomeRoute(userRole);
    navigate(homeRoute);
  }, [userRole, getRoleHomeRoute, navigate]);

  // Get current path segments
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Check if current route is active
  const isActive = useCallback(
    (path: string): boolean => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  // Check if current route starts with path
  const isActiveGroup = useCallback(
    (path: string): boolean => {
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  return {
    navigateTo,
    navigateBack,
    navigateToRoleHome,
    getRoleHomeRoute,
    currentPath: location.pathname,
    pathSegments,
    isActive,
    isActiveGroup,
    locationState: location.state as NavigationState | undefined,
  };
};
