import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Search,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof ReturnType<typeof useRolePermissions>['permissions'];
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    permission: 'canAccessDashboard',
  },
  {
    title: 'Search',
    href: '/search',
    icon: Search,
    permission: 'canAccessSearch',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'canAccessSettings',
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
    permission: 'canAccessHelp',
  },
];

export const PrimaryNavigationBar = () => {
  const location = useLocation();
  const { permissions, isLoading } = useRolePermissions();

  // Filter navigation items based on permissions
  const visibleNavItems = PRIMARY_NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  if (isLoading) {
    return (
      <div className="h-12 bg-white border-b flex items-center px-6">
        <div className="animate-pulse flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b">
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
                        'gap-2',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
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
