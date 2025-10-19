import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { SecondaryNavigationBar } from '@/components/navigation/SecondaryNavigationBar';
import { RoleIndicator } from '@/components/navigation/RoleIndicator';
import { PermissionGuard } from '@/components/navigation/PermissionGuard';
import { NavigationBreadcrumb } from '@/components/navigation/NavigationBreadcrumb';
import React from 'react';

// Mock hooks
vi.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => ({
    userRole: 'company_operator',
    permissions: {
      canAccessDashboard: true,
      canAccessDocuments: true,
      canAccessChat: true,
      canAccessSearch: true,
      canAccessSettings: true,
      canAccessHelp: true,
      canAccessUserManagement: true,
      canAccessAPIKeys: true,
      canAccessTokenDashboard: true,
      canAccessSystemSettings: false,
      canAccessUserLimits: false,
      canAccessAnalytics: true,
    },
    hasPermission: (permission: string) => permission !== 'canAccessSystemSettings',
    hasRole: (role: string) => role === 'company_operator',
    hasRoleOrHigher: (role: string) => {
      const hierarchy = {
        executive: 1,
        board: 2,
        administrator: 3,
        company_operator: 4,
        system_owner: 5,
      };
      return hierarchy.company_operator >= hierarchy[role as keyof typeof hierarchy];
    },
    isLoading: false,
    error: undefined,
    roleHierarchyLevel: 4,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

describe('Navigation Components Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  describe('PrimaryNavigationBar', () => {
    it('should render primary navigation items', () => {
      render(<PrimaryNavigationBar />, { wrapper });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('should highlight active navigation item', () => {
      render(<PrimaryNavigationBar />, { wrapper });

      // Check that Dashboard is highlighted (we're on root path)
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-accent');
    });

    it('should render navigation icons', () => {
      const { container } = render(<PrimaryNavigationBar />, { wrapper });

      // Check for SVG icons
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('SecondaryNavigationBar', () => {
    it('should render role-specific navigation items for company_operator', () => {
      render(<SecondaryNavigationBar />, { wrapper });

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText('Token Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should not render system owner items for company_operator', () => {
      render(<SecondaryNavigationBar />, { wrapper });

      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
      expect(screen.queryByText('User Limits')).not.toBeInTheDocument();
    });

    it('should render with correct styling', () => {
      const { container } = render(<SecondaryNavigationBar />, { wrapper });

      const navContainer = container.querySelector('.bg-gray-50');
      expect(navContainer).toBeInTheDocument();
    });
  });

  describe('RoleIndicator', () => {
    it('should display correct role badge', () => {
      render(<RoleIndicator />, { wrapper });

      expect(screen.getByText('Company Operator')).toBeInTheDocument();
    });

    it('should display role icon', () => {
      const { container } = render(<RoleIndicator showIcon={true} />, { wrapper });

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(<RoleIndicator showLabel={false} showIcon={true} />, { wrapper });

      expect(screen.queryByText('Company Operator')).not.toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(<RoleIndicator showIcon={false} showLabel={true} />, { wrapper });

      expect(screen.getByText('Company Operator')).toBeInTheDocument();
      const badge = container.querySelector('[class*="badge"]');
      const icon = badge?.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('PermissionGuard', () => {
    it('should render children when permission is granted', () => {
      render(
        <MemoryRouter>
          <PermissionGuard requiredPermission="canAccessUserManagement">
            <div>Protected Content</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show access denied when permission is not granted', () => {
      render(
        <MemoryRouter>
          <PermissionGuard requiredPermission="canAccessSystemSettings">
            <div>Protected Content</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should render fallback when provided and permission denied', () => {
      render(
        <MemoryRouter>
          <PermissionGuard
            requiredPermission="canAccessSystemSettings"
            fallback={<div>Custom Fallback</div>}
          >
            <div>Protected Content</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    });

    it('should allow access for users with required role or higher', () => {
      render(
        <MemoryRouter>
          <PermissionGuard requiredRole="administrator">
            <div>Admin Content</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should deny access for users without required role', () => {
      render(
        <MemoryRouter>
          <PermissionGuard requiredRole="system_owner">
            <div>System Owner Content</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.queryByText('System Owner Content')).not.toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('NavigationBreadcrumb', () => {
    it('should not render on home page', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <NavigationBreadcrumb />
        </MemoryRouter>
      );

      expect(container.querySelector('[aria-label="breadcrumb"]')).not.toBeInTheDocument();
    });

    it('should render breadcrumb on admin pages', () => {
      render(
        <MemoryRouter initialEntries={['/admin/user-management']}>
          <NavigationBreadcrumb />
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should render home icon when showHome is true', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/admin/user-management']}>
          <NavigationBreadcrumb showHome={true} />
        </MemoryRouter>
      );

      const homeIcon = container.querySelector('svg');
      expect(homeIcon).toBeInTheDocument();
    });

    it('should render breadcrumb for board pages', () => {
      render(
        <MemoryRouter initialEntries={['/board/policy-analysis']}>
          <NavigationBreadcrumb />
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Board')).toBeInTheDocument();
      expect(screen.getByText('Policy Analysis')).toBeInTheDocument();
    });

    it('should render links for non-final segments', () => {
      render(
        <MemoryRouter initialEntries={['/admin/user-management']}>
          <NavigationBreadcrumb />
        </MemoryRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/');

      const adminLink = screen.getByText('Admin').closest('a');
      expect(adminLink).toHaveAttribute('href', '/admin');
    });
  });

  describe('Navigation Integration', () => {
    it('should render complete navigation system together', () => {
      render(
        <div>
          <PrimaryNavigationBar />
          <SecondaryNavigationBar />
          <NavigationBreadcrumb />
          <RoleIndicator />
        </div>,
        { wrapper }
      );

      // Primary nav items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();

      // Secondary nav items
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();

      // Role indicator
      expect(screen.getByText('Company Operator')).toBeInTheDocument();
    });

    it('should maintain consistent styling across navigation components', () => {
      const { container } = render(
        <div>
          <PrimaryNavigationBar />
          <SecondaryNavigationBar />
        </div>,
        { wrapper }
      );

      const primaryNav = container.querySelector('.bg-white');
      const secondaryNav = container.querySelector('.bg-gray-50');

      expect(primaryNav).toBeInTheDocument();
      expect(secondaryNav).toBeInTheDocument();
    });
  });
});
