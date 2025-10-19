import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useRolePermissions, UserRole } from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import {
  Users,
  Key,
  BarChart3,
  Settings2,
  Sliders,
  Shield,
  TrendingUp,
  AlertTriangle,
  Database,
} from 'lucide-react';

interface SecondaryNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof ReturnType<typeof useRolePermissions>['permissions'];
  requiredRole?: UserRole;
}

// Role-specific secondary navigation
const SECONDARY_NAV_BY_ROLE: Record<UserRole, SecondaryNavItem[]> = {
  system_owner: [
    {
      title: 'System Settings',
      href: '/admin/system-settings',
      icon: Settings2,
      permission: 'canAccessSystemSettings',
    },
    {
      title: 'User Limits',
      href: '/admin/user-limits',
      icon: Sliders,
      permission: 'canAccessUserLimits',
    },
    {
      title: 'User Management',
      href: '/admin/user-management',
      icon: Users,
      permission: 'canAccessUserManagement',
    },
    {
      title: 'API Keys',
      href: '/admin/api-keys',
      icon: Key,
      permission: 'canAccessAPIKeys',
    },
    {
      title: 'Token Dashboard',
      href: '/admin/token-dashboard',
      icon: BarChart3,
      permission: 'canAccessTokenDashboard',
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      permission: 'canAccessAnalytics',
    },
  ],
  company_operator: [
    {
      title: 'User Management',
      href: '/admin/user-management',
      icon: Users,
      permission: 'canAccessUserManagement',
    },
    {
      title: 'API Keys',
      href: '/admin/api-keys',
      icon: Key,
      permission: 'canAccessAPIKeys',
    },
    {
      title: 'Token Dashboard',
      href: '/admin/token-dashboard',
      icon: BarChart3,
      permission: 'canAccessTokenDashboard',
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      permission: 'canAccessAnalytics',
    },
  ],
  board: [
    {
      title: 'Strategic Overview',
      href: '/board/overview',
      icon: TrendingUp,
    },
    {
      title: 'Policy Analysis',
      href: '/board/policy-analysis',
      icon: BarChart3,
    },
    {
      title: 'Risk Assessment',
      href: '/board/risk-assessment',
      icon: AlertTriangle,
    },
    {
      title: 'System Alerts',
      href: '/board/alerts',
      icon: Shield,
    },
  ],
  administrator: [
    {
      title: 'Document Management',
      href: '/admin/documents',
      icon: Database,
    },
    {
      title: 'Content Analytics',
      href: '/admin/content-analytics',
      icon: BarChart3,
    },
  ],
  executive: [],
};

export const SecondaryNavigationBar = () => {
  const location = useLocation();
  const { userRole, permissions, isLoading } = useRolePermissions();

  // Get secondary navigation items for the current user role
  const secondaryNavItems = userRole ? SECONDARY_NAV_BY_ROLE[userRole] : [];

  // Filter navigation items based on permissions
  const visibleNavItems = secondaryNavItems.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  // Don't show secondary nav if no items are visible
  if (visibleNavItems.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-10 bg-gray-50 border-b flex items-center px-6">
        <div className="animate-pulse flex space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-6">
        <NavigationMenu className="max-w-none justify-start">
          <NavigationMenuList>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'gap-2 text-sm h-8',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};
