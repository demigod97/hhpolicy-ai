import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

// Route to breadcrumb mapping
const ROUTE_BREADCRUMB_MAP: Record<string, BreadcrumbSegment[]> = {
  '/': [{ label: 'Dashboard' }],
  '/documents': [
    { label: 'Dashboard', href: '/' },
    { label: 'Documents' },
  ],
  '/chat': [
    { label: 'Dashboard', href: '/' },
    { label: 'Chat' },
  ],
  '/search': [
    { label: 'Dashboard', href: '/' },
    { label: 'Search' },
  ],
  '/settings': [
    { label: 'Dashboard', href: '/' },
    { label: 'Settings' },
  ],
  '/help': [
    { label: 'Dashboard', href: '/' },
    { label: 'Help' },
  ],
  '/admin/user-management': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'User Management' },
  ],
  '/admin/api-keys': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'API Keys' },
  ],
  '/admin/token-dashboard': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Token Dashboard' },
  ],
  '/admin/system-settings': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'System Settings' },
  ],
  '/admin/user-limits': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'User Limits' },
  ],
  '/admin/analytics': [
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Analytics' },
  ],
  '/board/overview': [
    { label: 'Dashboard', href: '/' },
    { label: 'Board', href: '/board' },
    { label: 'Strategic Overview' },
  ],
  '/board/policy-analysis': [
    { label: 'Dashboard', href: '/' },
    { label: 'Board', href: '/board' },
    { label: 'Policy Analysis' },
  ],
  '/board/risk-assessment': [
    { label: 'Dashboard', href: '/' },
    { label: 'Board', href: '/board' },
    { label: 'Risk Assessment' },
  ],
  '/board/alerts': [
    { label: 'Dashboard', href: '/' },
    { label: 'Board', href: '/board' },
    { label: 'System Alerts' },
  ],
};

interface NavigationBreadcrumbProps {
  className?: string;
  showHome?: boolean;
}

export const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({
  className,
  showHome = true,
}) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Get breadcrumb segments for current route
  const segments = ROUTE_BREADCRUMB_MAP[pathname] || [
    { label: 'Dashboard', href: '/' },
    { label: 'Page Not Found' },
  ];

  // Don't show breadcrumb on home page
  if (pathname === '/' && segments.length === 1) {
    return null;
  }

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span className="sr-only">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {segments.length > 0 && <BreadcrumbSeparator />}
            </>
          )}
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {segment.href && !isLast ? (
                    <BreadcrumbLink asChild>
                      <Link to={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
