import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  HelpCircle,
  Crown,
  Building,
  Settings,
  User
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board_member' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onRoleUpdate: (userId: string, newRole: string) => void;
  isLoading: boolean;
}

const RoleAssignmentDialog = ({
  open,
  onOpenChange,
  user,
  onRoleUpdate,
  isLoading
}: RoleAssignmentDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setSelectedRole(user.role);
      setCurrentUserRole(user.role);
    } else {
      setSelectedRole('');
      setCurrentUserRole('');
    }
  }, [open, user]);

  const handleRoleUpdate = () => {
    if (user && selectedRole && selectedRole !== currentUserRole) {
      onRoleUpdate(user.id, selectedRole);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_owner':
        return <Crown className="h-4 w-4 text-red-600" />;
      case 'company_operator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'board_member':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'administrator':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'executive':
        return <User className="h-4 w-4 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'system_owner':
        return {
          title: 'System Owner',
          description: 'Full system access including user management, system configuration, and all administrative functions.',
          permissions: [
            'Manage all users and roles',
            'Configure system settings',
            'Access all data and features',
            'Assign any role including other System Owners'
          ]
        };
      case 'company_operator':
        return {
          title: 'Company Operator',
          description: 'Company-level management with user role assignment capabilities.',
          permissions: [
            'Assign roles to company users',
            'Manage company settings',
            'Access company-wide data',
            'Cannot assign System Owner role'
          ]
        };
      case 'board_member':
        return {
          title: 'Board Member',
          description: 'High-level access for board members and executives.',
          permissions: [
            'View executive reports',
            'Access strategic documents',
            'Participate in board discussions',
            'Limited administrative access'
          ]
        };
      case 'administrator':
        return {
          title: 'Administrator',
          description: 'Administrative access for system management and user support.',
          permissions: [
            'Manage user accounts',
            'Configure system settings',
            'Access administrative tools',
            'Support user requests'
          ]
        };
      case 'executive':
        return {
          title: 'Executive',
          description: 'Executive-level access for leadership and decision-making.',
          permissions: [
            'Access executive dashboards',
            'View strategic reports',
            'Participate in executive discussions',
            'Limited administrative access'
          ]
        };
      default:
        return {
          title: 'Unknown Role',
          description: 'Role description not available.',
          permissions: []
        };
    }
  };

  const getAvailableRoles = () => {
    // Company Operators can assign all roles except System Owner
    // System Owners can assign any role including other System Owners
    // For now, we'll show all roles - the backend will enforce permissions
    return [
      { value: 'company_operator', label: 'Company Operator' },
      { value: 'board_member', label: 'Board Member' },
      { value: 'administrator', label: 'Administrator' },
      { value: 'executive', label: 'Executive' },
      { value: 'system_owner', label: 'System Owner' }
    ];
  };

  const roleInfo = selectedRole ? getRoleDescription(selectedRole) : null;
  const hasRoleChanged = selectedRole && selectedRole !== currentUserRole;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Assign Role</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Role assignment controls user access levels and permissions. 
                    Changes take effect immediately.
                  </p>
                </TooltipContent>
              </Tooltip>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Information */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">User Information</h4>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700">
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Current Role:</strong> {getRoleDescription(user.role).title}
                  </p>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role-select">Select New Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
                disabled={isLoading}
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Choose a role for this user" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.value)}
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Description */}
            {roleInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getRoleIcon(selectedRole)}
                  <h5 className="font-medium text-gray-900">{roleInfo.title}</h5>
                </div>
                <p className="text-sm text-gray-700 mb-3">{roleInfo.description}</p>
                <div>
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Permissions:</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {roleInfo.permissions.map((permission, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Role Change Warning */}
            {hasRoleChanged && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Role Change Warning:</strong> Changing from{' '}
                  <strong>{getRoleDescription(currentUserRole).title}</strong> to{' '}
                  <strong>{getRoleDescription(selectedRole).title}</strong> will immediately 
                  affect this user's access permissions and capabilities.
                </AlertDescription>
              </Alert>
            )}

            {/* System Owner Warning */}
            {selectedRole === 'system_owner' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>System Owner Assignment:</strong> System Owners have full system access 
                  and can assign any role including other System Owners. This is the highest 
                  privilege level in the system.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={!hasRoleChanged || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating Role...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default RoleAssignmentDialog;