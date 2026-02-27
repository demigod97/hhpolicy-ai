import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Users, 
  AlertTriangle, 
  Loader, 
  HelpCircle,
  X,
  Shield,
  Crown,
  Building,
  Settings,
  User
} from 'lucide-react';

interface BulkActionBarProps {
  selectedUsers: string[];
  onBulkRoleUpdate: (role: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const BulkActionBar = ({
  selectedUsers,
  onBulkRoleUpdate,
  onClose,
  isLoading
}: BulkActionBarProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleBulkRoleUpdate = () => {
    if (selectedRole) {
      onBulkRoleUpdate(selectedRole);
      setSelectedRole('');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_owner':
        return <Crown className="h-4 w-4 text-red-600" />;
      case 'company_operator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'board':
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
        return 'Full system access including user management and system configuration';
      case 'company_operator':
        return 'Company-level management with user role assignment capabilities';
      case 'board':
        return 'High-level access for board members and executives';
      case 'administrator':
        return 'Administrative access for system management and user support';
      case 'executive':
        return 'Executive-level access for leadership and decision-making';
      default:
        return 'Role description not available';
    }
  };

  const getAvailableRoles = () => {
    return [
      { value: 'company_operator', label: 'Company Operator' },
      { value: 'board', label: 'Board Member' },
      { value: 'administrator', label: 'Administrator' },
      { value: 'executive', label: 'Executive' },
      { value: 'system_owner', label: 'System Owner' }
    ];
  };

  const roleInfo = selectedRole ? getRoleDescription(selectedRole) : null;

  return (
    <TooltipProvider>
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">
                Bulk Actions ({selectedUsers.length} users selected)
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Bulk actions allow you to perform operations on multiple users at once. 
                    Use caution as changes affect all selected users immediately.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Role Selection */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="bulk-role-select">Assign Role to All Selected Users</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                  disabled={isLoading}
                >
                  <SelectTrigger id="bulk-role-select" className="mt-1">
                    <SelectValue placeholder="Choose a role for all selected users" />
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
              <Button
                onClick={handleBulkRoleUpdate}
                disabled={!selectedRole || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Update All
                  </>
                )}
              </Button>
            </div>

            {/* Role Description */}
            {roleInfo && (
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  {getRoleIcon(selectedRole)}
                  <span className="font-medium text-gray-900">
                    {getAvailableRoles().find(r => r.value === selectedRole)?.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{roleInfo}</p>
              </div>
            )}

            {/* Bulk Operation Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Bulk Operation Warning:</strong> This will immediately change the role 
                for all {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}. 
                Make sure you understand the impact before proceeding.
              </AlertDescription>
            </Alert>

            {/* System Owner Warning */}
            {selectedRole === 'system_owner' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>System Owner Assignment:</strong> You are about to assign System Owner 
                  privileges to {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}. 
                  System Owners have full system access and can assign any role including other 
                  System Owners. This is the highest privilege level in the system.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default BulkActionBar;