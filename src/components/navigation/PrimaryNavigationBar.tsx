import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/services/authService';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Users,
  HelpCircle,
  User,
  LogOut,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showForRoles: ('board' | 'executive' | 'administrator' | 'company_operator' | 'system_owner')[];
}

// Minimal navigation focused on core RAG functionality
const NAV_ITEMS: NavItem[] = [
  {
    title: 'Documents',
    href: '/',
    icon: LayoutDashboard,
    showForRoles: ['board', 'executive', 'administrator', 'company_operator', 'system_owner'],
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    showForRoles: ['board', 'executive', 'administrator', 'company_operator', 'system_owner'],
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
    showForRoles: ['company_operator', 'system_owner'], // Only System Owner and Company Operator can upload
  },
  {
    title: 'Users',
    href: '/admin/user-management', // Links to UserManagement page
    icon: Users,
    showForRoles: ['company_operator', 'system_owner'],
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
    showForRoles: ['board', 'executive', 'administrator', 'company_operator', 'system_owner'],
  },
];

export const PrimaryNavigationBar = () => {
  const location = useLocation();
  const { userRole, isLoading } = useRolePermissions();
  const { user } = useAuth();
  const { logout } = useLogout();

  // Filter navigation items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.showForRoles.includes(userRole);
  });

  if (isLoading) {
    return (
      <div className="h-16 bg-white border-b border-border shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-lg animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-base">HH</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl text-foreground">PolicyAi</span>
              <span className="text-xs text-muted-foreground">Human Habitat</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  asChild
                  className={cn(
                    'gap-2',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Link to={item.href}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.title}</span>
                  </Link>
                </Button>
              );
            })}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 p-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all hover:scale-105">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">Account</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
