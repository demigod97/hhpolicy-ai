import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  Activity,
  Crown,
  Building,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board_member' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

interface UserDetailViewProps {
  user: User;
  onRoleAssignment: (user: User) => void;
}

const UserDetailView = ({ user, onRoleAssignment }: UserDetailViewProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_owner':
        return <Crown className="h-5 w-5 text-red-600" />;
      case 'company_operator':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'board_member':
        return <Building className="h-5 w-5 text-purple-600" />;
      case 'administrator':
        return <Settings className="h-5 w-5 text-green-600" />;
      case 'executive':
        return <User className="h-5 w-5 text-orange-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'destructive';
      case 'company_operator':
        return 'default';
      case 'board_member':
        return 'secondary';
      case 'administrator':
        return 'outline';
      case 'executive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'System Owner';
      case 'company_operator':
        return 'Company Operator';
      case 'board_member':
        return 'Board Member';
      case 'administrator':
        return 'Administrator';
      case 'executive':
        return 'Executive';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'Full system access including user management, system configuration, and all administrative functions.';
      case 'company_operator':
        return 'Company-level management with user role assignment capabilities.';
      case 'board_member':
        return 'High-level access for board members and executives.';
      case 'administrator':
        return 'Administrative access for system management and user support.';
      case 'executive':
        return 'Executive-level access for leadership and decision-making.';
      default:
        return 'Role description not available.';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const formatLastActive = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>User Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isActive ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role & Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="font-medium">{getRoleDisplayName(user.role)}</span>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(user.role)}
              </p>
              
              <Button
                onClick={() => onRoleAssignment(user)}
                variant="outline"
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </Button>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Active</p>
                    <p className="text-sm text-muted-foreground">
                      {formatLastActive(user.lastActive)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailView;