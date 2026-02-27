import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRolePermissions, UserRole } from '@/hooks/useRolePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof ReturnType<typeof useRolePermissions>['permissions'];
  fallback?: ReactNode;
  redirectTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/',
}) => {
  const location = useLocation();
  const { userRole, hasRoleOrHigher, hasPermission, isLoading } = useRolePermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRoleOrHigher(requiredRole)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return (
      fallback || (
        <div className="max-w-2xl mx-auto mt-8 px-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have the required role to access this page. Required role:{' '}
              <strong>{requiredRole}</strong>. Your role: <strong>{userRole || 'none'}</strong>.
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return (
      fallback || (
        <div className="max-w-2xl mx-auto mt-8 px-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have the required permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  // User has required access
  return <>{children}</>;
};

interface ConditionalRenderProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof ReturnType<typeof useRolePermissions>['permissions'];
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
}) => {
  const { hasRoleOrHigher, hasPermission, isLoading } = useRolePermissions();

  if (isLoading) {
    return null;
  }

  // Check role-based access
  if (requiredRole && !hasRoleOrHigher(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
