import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import UserManagementDashboard from '@/components/admin/UserManagementDashboard';

const UserManagement = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Admin Access Required</span>
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-muted-foreground">
              Users with admin access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Management Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Role Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-800 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Company Operator Capabilities</span>
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Assign roles to company users</li>
                <li>• Manage company settings</li>
                <li>• Access company-wide data</li>
                <li>• Cannot assign System Owner role</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-orange-800 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>System Owner Capabilities</span>
              </h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Assign any role including System Owner</li>
                <li>• Full system configuration access</li>
                <li>• Manage all users and permissions</li>
                <li>• Access all system features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <UserManagementDashboard />
    </div>
  );
};

export default UserManagement;
