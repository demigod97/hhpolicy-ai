import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRolePermissions, ROLE_HIERARCHY, NAVIGATION_PERMISSIONS } from '@/hooks/useRolePermissions';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

describe('useRolePermissions Hook', () => {
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Role Hierarchy', () => {
    it('should have correct role hierarchy levels', () => {
      expect(ROLE_HIERARCHY.executive).toBe(1);
      expect(ROLE_HIERARCHY.board).toBe(2);
      expect(ROLE_HIERARCHY.administrator).toBe(3);
      expect(ROLE_HIERARCHY.company_operator).toBe(4);
      expect(ROLE_HIERARCHY.system_owner).toBe(5);
    });

    it('should recognize system_owner has highest privileges', () => {
      expect(ROLE_HIERARCHY.system_owner).toBeGreaterThan(ROLE_HIERARCHY.company_operator);
      expect(ROLE_HIERARCHY.system_owner).toBeGreaterThan(ROLE_HIERARCHY.board);
      expect(ROLE_HIERARCHY.system_owner).toBeGreaterThan(ROLE_HIERARCHY.administrator);
      expect(ROLE_HIERARCHY.system_owner).toBeGreaterThan(ROLE_HIERARCHY.executive);
    });

    it('should recognize executive has lowest privileges', () => {
      expect(ROLE_HIERARCHY.executive).toBeLessThan(ROLE_HIERARCHY.board);
      expect(ROLE_HIERARCHY.executive).toBeLessThan(ROLE_HIERARCHY.administrator);
      expect(ROLE_HIERARCHY.executive).toBeLessThan(ROLE_HIERARCHY.company_operator);
      expect(ROLE_HIERARCHY.executive).toBeLessThan(ROLE_HIERARCHY.system_owner);
    });
  });

  describe('Navigation Permissions', () => {
    it('should have correct permissions for executive role', () => {
      const execPerms = NAVIGATION_PERMISSIONS.executive;
      expect(execPerms.canAccessDashboard).toBe(true);
      expect(execPerms.canAccessDocuments).toBe(true);
      expect(execPerms.canAccessChat).toBe(true);
      expect(execPerms.canAccessUserManagement).toBe(false);
      expect(execPerms.canAccessAPIKeys).toBe(false);
      expect(execPerms.canAccessSystemSettings).toBe(false);
    });

    it('should have correct permissions for system_owner role', () => {
      const ownerPerms = NAVIGATION_PERMISSIONS.system_owner;
      expect(ownerPerms.canAccessDashboard).toBe(true);
      expect(ownerPerms.canAccessUserManagement).toBe(true);
      expect(ownerPerms.canAccessAPIKeys).toBe(true);
      expect(ownerPerms.canAccessSystemSettings).toBe(true);
      expect(ownerPerms.canAccessUserLimits).toBe(true);
    });

    it('should have correct permissions for company_operator role', () => {
      const operatorPerms = NAVIGATION_PERMISSIONS.company_operator;
      expect(operatorPerms.canAccessUserManagement).toBe(true);
      expect(operatorPerms.canAccessAPIKeys).toBe(true);
      expect(operatorPerms.canAccessSystemSettings).toBe(false);
      expect(operatorPerms.canAccessUserLimits).toBe(false);
    });
  });

  describe('Hook Functionality', () => {
    it('should fetch and return user role from database', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                role: 'system_owner',
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useRolePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.userRole).toBe('system_owner');
      expect(result.current.roleHierarchyLevel).toBe(5);
    });

    it('should return executive permissions by default when no role', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('No role found'),
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useRolePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual(NAVIGATION_PERMISSIONS.executive);
    });
  });

  describe('Permission Helpers', () => {
    it('hasPermission should correctly check permissions', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                role: 'company_operator',
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useRolePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasPermission('canAccessUserManagement')).toBe(true);
      expect(result.current.hasPermission('canAccessSystemSettings')).toBe(false);
    });

    it('hasRoleOrHigher should correctly check role hierarchy', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                role: 'company_operator',
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useRolePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRoleOrHigher('executive')).toBe(true);
      expect(result.current.hasRoleOrHigher('board')).toBe(true);
      expect(result.current.hasRoleOrHigher('administrator')).toBe(true);
      expect(result.current.hasRoleOrHigher('company_operator')).toBe(true);
      expect(result.current.hasRoleOrHigher('system_owner')).toBe(false);
    });

    it('hasRole should check for exact role match', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                role: 'board',
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useRolePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole('board')).toBe(true);
      expect(result.current.hasRole('executive')).toBe(false);
      expect(result.current.hasRole('system_owner')).toBe(false);
    });
  });
});
