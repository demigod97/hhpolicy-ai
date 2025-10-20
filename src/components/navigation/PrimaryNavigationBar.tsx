import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Users,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showForRoles: ('board' | 'executive' | 'administrator' | 'company_operator' | 'system_owner')[];
}

// Minimal navigation focused on core RAG functionality
const NAV_ITEMS: NavItem[] = [
  {
    title: 'Policies',
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

  // Filter navigation items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!userRole) return false;
    return item.showForRoles.includes(userRole);
  });

  if (isLoading) {
    return (
      <div className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">PA</span>
            </div>
            <span className="font-semibold text-lg">PolicyAi</span>
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
          </div>
        </div>
      </div>
    </nav>
  );
};
