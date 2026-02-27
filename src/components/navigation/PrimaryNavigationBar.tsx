import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/services/authService';
import { useChatSessions } from '@/hooks/useChatSession';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Users,
  HelpCircle,
  User,
  LogOut,
  Settings,
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
    href: '/chat', // Will be overridden dynamically
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
    showForRoles: ['board', 'administrator', 'company_operator', 'system_owner'],
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
  const { sessions } = useChatSessions();

  // Get the most recent session ID for Chat navigation
  const mostRecentSessionId = sessions.length > 0 ? sessions[0].id : null;

  // Filter navigation items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.showForRoles.includes(userRole);
  }).map((item) => {
    // Override Chat href with most recent session ID
    if (item.title === 'Chat' && mostRecentSessionId) {
      return { ...item, href: `/chat/${mostRecentSessionId}` };
    }
    return item;
  });

  if (isLoading) {
    return (
      <div className="h-16 bg-[#1e3a8a] border-b border-white/10 shadow-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-lg animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-5 w-24 bg-white/20 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 bg-white/20 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-[#1e3a8a] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <span className="text-[#1e3a8a] font-bold text-base">HH</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl text-white">PolicyAi</span>
              <span className="text-xs text-white/80">Human Habitat</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              // Check if active - handle both exact match and /chat/:sessionId pattern
              const isActive = location.pathname === item.href || 
                (item.title === 'Chat' && location.pathname.startsWith('/chat/'));

              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    'gap-2 text-white hover:bg-white/10 hover:text-blue-300 transition-colors',
                    isActive && 'bg-white/15 text-blue-300'
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
                <Button variant="ghost" size="sm" className="ml-2 p-0 hover:bg-white/10">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 shadow-sm">
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
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
