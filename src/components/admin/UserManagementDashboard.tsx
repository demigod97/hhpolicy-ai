import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  UserPlus, 
  Download,
  RefreshCw
} from 'lucide-react';
import UserTable from './UserTable';
import RoleAssignmentDialog from './RoleAssignmentDialog';
import BulkActionBar from './BulkActionBar';
import { useUserManagement } from '@/hooks/useUserManagement';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

const UserManagementDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const {
    fetchUsers,
    updateUserRole,
    bulkUpdateUserRoles,
    isLoading: isOperationLoading
  } = useUserManagement();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await fetchUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleRoleAssignment = (user: User) => {
    setSelectedUserForRole(user);
    setShowRoleDialog(true);
  };

  const handleBulkRoleAssignment = () => {
    setShowBulkActions(true);
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ userId, newRole });
      await loadUsers(); // Refresh the list
      setShowRoleDialog(false);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleBulkRoleUpdate = async (role: string) => {
    try {
      await bulkUpdateUserRoles({ userIds: selectedUsers, newRole: role });
      setSelectedUsers([]);
      setShowBulkActions(false);
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to bulk update user roles:', error);
    }
  };

  const handleUserSelection = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'system_owner':
        return 'destructive';
      case 'company_operator':
        return 'default';
      case 'board':
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'company_operator').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'administrator').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="system_owner">System Owner</SelectItem>
                <SelectItem value="company_operator">Company Operator</SelectItem>
                <SelectItem value="board">Board Member</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            {selectedUsers.length > 0 && (
              <Button
                onClick={handleBulkRoleAssignment}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
          </div>

          {/* User Table */}
          <UserTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelection={handleUserSelection}
            onSelectAll={handleSelectAll}
            onRoleAssignment={handleRoleAssignment}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUserForRole}
        onRoleUpdate={handleRoleUpdate}
        isLoading={isOperationLoading}
      />

      {/* Bulk Actions */}
      {showBulkActions && (
        <BulkActionBar
          selectedUsers={selectedUsers}
          onBulkRoleUpdate={handleBulkRoleUpdate}
          onClose={() => setShowBulkActions(false)}
          isLoading={isOperationLoading}
        />
      )}
    </div>
  );
};

export default UserManagementDashboard;
