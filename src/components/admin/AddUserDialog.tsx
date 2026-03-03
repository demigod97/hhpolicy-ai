import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  UserPlus,
  Loader,
  Crown,
  Shield,
  Building,
  Settings,
  User,
  Info
} from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteUser: (email: string, role: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AddUserDialog = ({
  open,
  onOpenChange,
  onInviteUser,
  isLoading
}: AddUserDialogProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail('');
      setName('');
      setSelectedRole('');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!email || !selectedRole) return;
    const result = await onInviteUser(email, selectedRole, name || undefined);
    if (result.success) {
      handleClose(false);
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
        return 'Full system access including user management and system configuration.';
      case 'company_operator':
        return 'Company-level management with user role assignment capabilities.';
      case 'board':
        return 'High-level access for board members and executives.';
      case 'administrator':
        return 'Administrative access for system management and user support.';
      case 'executive':
        return 'Executive-level access for leadership and decision-making.';
      default:
        return '';
    }
  };

  const availableRoles = [
    { value: 'executive', label: 'Executive' },
    { value: 'board', label: 'Board Member' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'company_operator', label: 'Company Operator' },
    { value: 'system_owner', label: 'System Owner' }
  ];

  const isValid = email.trim() !== '' && selectedRole !== '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Invite New User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              An invitation email will be sent to the user with a link to set up their account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address *</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name (optional)</Label>
            <Input
              id="invite-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Assign Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
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

          {selectedRole && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                {getRoleIcon(selectedRole)}
                <span className="text-sm font-medium">
                  {availableRoles.find(r => r.value === selectedRole)?.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(selectedRole)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Sending Invite...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
