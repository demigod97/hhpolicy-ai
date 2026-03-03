import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Loader,
  Crown,
  Shield,
  Building,
  User
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onUpdateUser: (userId: string, name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const EditUserDialog = ({
  open,
  onOpenChange,
  user,
  onUpdateUser,
  isLoading
}: EditUserDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [open, user]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setName('');
      setEmail('');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const nameChanged = name !== user.name ? name : undefined;
    const emailChanged = email !== user.email ? email : undefined;

    if (!nameChanged && !emailChanged) return;

    const result = await onUpdateUser(user.id, nameChanged, emailChanged);
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'destructive' as const;
      case 'company_operator':
        return 'default' as const;
      case 'board':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'System Owner';
      case 'company_operator':
        return 'Company Operator';
      case 'board':
        return 'Board Member';
      case 'administrator':
        return 'Administrator';
      case 'executive':
        return 'Executive';
      default:
        return role;
    }
  };

  if (!user) return null;

  const hasChanges = name !== user.name || email !== user.email;
  const isValid = name.trim() !== '' && email.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Edit User</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Role (read-only) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <Label className="text-xs text-muted-foreground">Current Role</Label>
            <div className="flex items-center space-x-2 mt-1">
              {getRoleIcon(user.role)}
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                (Use "Assign Role" to change)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
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
            disabled={!hasChanges || !isValid || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
