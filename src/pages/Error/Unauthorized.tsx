import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigation } from '@/hooks/useNavigation';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { RoleDescription } from '@/components/navigation/RoleIndicator';
import { AlertTriangle, Lock, ArrowLeft, Home } from 'lucide-react';
import { NavigationState } from '@/hooks/useNavigation';

const Unauthorized = () => {
  const location = useLocation();
  const { navigateBack, navigateToRoleHome } = useNavigation();
  const { userRole } = useRolePermissions();
  const state = location.state as NavigationState | undefined;

  const attemptedPath = state?.from || 'this page';
  const errorMessage = state?.message || 'You do not have permission to access this page.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription>You don't have permission to view this resource</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unauthorized Access Attempt</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{errorMessage}</p>
              {attemptedPath !== 'this page' && (
                <p className="mt-2 text-sm">
                  Attempted to access: <code className="font-mono text-xs">{attemptedPath}</code>
                </p>
              )}
            </AlertDescription>
          </Alert>

          {userRole && (
            <div>
              <h3 className="text-sm font-medium mb-2">Your Current Role</h3>
              <RoleDescription role={userRole} />
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-2">What you can do:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Return to the previous page</li>
              <li>• Go to your role-specific home page</li>
              <li>• Contact your administrator if you believe you should have access</li>
              <li>• Check your user role and permissions</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Need different permissions?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              If you need access to additional features, contact your Company Operator or System Owner to
              request a role change. Each role has specific permissions designed for different job functions.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={() => navigateBack('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigateToRoleHome()} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
