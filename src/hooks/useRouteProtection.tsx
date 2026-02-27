import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRolePermissions, UserRole } from './useRolePermissions';
import { useNavigation } from './useNavigation';

export interface RouteProtectionConfig {
  requiredRole?: UserRole;
  requiredPermission?: keyof ReturnType<typeof useRolePermissions>['permissions'];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useRouteProtection = ({
  requiredRole,
  requiredPermission,
  redirectTo = '/unauthorized',
  onUnauthorized,
}: RouteProtectionConfig) => {
  const location = useLocation();
  const { navigateTo } = useNavigation();
  const { userRole, hasRoleOrHigher, hasPermission, isLoading } = useRolePermissions();

  useEffect(() => {
    // Skip check while loading
    if (isLoading) return;

    let isAuthorized = true;

    // Check role-based access
    if (requiredRole && !hasRoleOrHigher(requiredRole)) {
      isAuthorized = false;
    }

    // Check permission-based access
    if (requiredPermission && !hasPermission(requiredPermission)) {
      isAuthorized = false;
    }

    // Handle unauthorized access
    if (!isAuthorized) {
      if (onUnauthorized) {
        onUnauthorized();
      }
      navigateTo(redirectTo, {
        from: location.pathname,
        message: `Access denied. Required role: ${requiredRole || 'unknown'}`,
      });
    }
  }, [
    isLoading,
    requiredRole,
    requiredPermission,
    hasRoleOrHigher,
    hasPermission,
    redirectTo,
    onUnauthorized,
    navigateTo,
    location.pathname,
  ]);

  return {
    isAuthorized:
      (!requiredRole || hasRoleOrHigher(requiredRole)) &&
      (!requiredPermission || hasPermission(requiredPermission)),
    isLoading,
    userRole,
  };
};

// Route configuration helper
export const createProtectedRoute = (config: RouteProtectionConfig) => {
  return {
    ...config,
    element: (WrappedComponent: React.ComponentType) => {
      const ProtectedComponent = (props: Record<string, unknown>) => {
        useRouteProtection(config);
        return <WrappedComponent {...props} />;
      };
      return ProtectedComponent;
    },
  };
};
