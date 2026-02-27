import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  User, 
  Shield, 
  Crown, 
  Building, 
  Settings,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  onUserSelection: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRoleAssignment: (user: User) => void;
  isLoading: boolean;
}

const UserTable = ({
  users,
  selectedUsers,
  onUserSelection,
  onSelectAll,
  onRoleAssignment,
  isLoading
}: UserTableProps) => {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No users found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => 
                    onUserSelection(user.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(user.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatLastActive(user.lastActive)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRoleAssignment(user)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Assign Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;