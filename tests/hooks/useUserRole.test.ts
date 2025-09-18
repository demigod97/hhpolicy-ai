import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { getCurrentUserRole } from '@/services/authService';
import { AuthContext } from '@/contexts/AuthContext';
import React from 'react';

// Mock the authService
vi.mock('@/services/authService', () => ({
  getCurrentUserRole: vi.fn(),
}));

const mockGetCurrentUserRole = vi.mocked(getCurrentUserRole);

describe('useUserRole Hook Security Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const createWrapper = (user: any = null, isAuthenticated: boolean = false) => {
    const mockAuthContextValue = {
      user,
      session: null,
      loading: false,
      error: null,
      isAuthenticated,
      signOut: vi.fn(),
    };

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContextValue}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Role Verification Security', () => {
    it('should return null role for unauthenticated users', async () => {
      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(null, false),
      });

      expect(result.current.userRole).toBe(undefined);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdministrator()).toBe(false);
      expect(result.current.isExecutive()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
    });

    it('should correctly identify Administrator role', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      expect(result.current.isAdministrator()).toBe(true);
      expect(result.current.isExecutive()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
      expect(result.current.hasRole('administrator')).toBe(true);
      expect(result.current.hasRole('executive')).toBe(true); // Admin has executive permissions
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should correctly identify Executive role with limited permissions', async () => {
      const mockUser = { id: 'user-2', email: 'exec@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('executive');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('executive');
      });

      expect(result.current.isAdministrator()).toBe(false);
      expect(result.current.isExecutive()).toBe(true);
      expect(result.current.isSuperAdmin()).toBe(false);
      expect(result.current.hasRole('administrator')).toBe(false); // Executive does NOT have admin permissions
      expect(result.current.hasRole('executive')).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should correctly identify SuperAdmin role with all permissions', async () => {
      const mockUser = { id: 'user-3', email: 'super@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('super_admin');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('super_admin');
      });

      expect(result.current.isAdministrator()).toBe(true); // SuperAdmin has all permissions
      expect(result.current.isExecutive()).toBe(false); // But isExecutive() checks exact role
      expect(result.current.isSuperAdmin()).toBe(true);
      expect(result.current.hasRole('administrator')).toBe(true);
      expect(result.current.hasRole('executive')).toBe(true);
      expect(result.current.hasRole('super_admin')).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle role hierarchy correctly', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      // Administrator should have access to executive-level permissions
      expect(result.current.hasRole('executive')).toBe(true);
      // But not super admin permissions
      expect(result.current.hasRole('super_admin')).toBe(false);
    });

    it('should handle authentication errors securely', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockGetCurrentUserRole.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.userRole).toBe(undefined);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdministrator()).toBe(false);
      expect(result.current.isExecutive()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
    });

    it('should not make API calls for unauthenticated users', async () => {
      renderHook(() => useUserRole(), {
        wrapper: createWrapper(null, false),
      });

      // Should not call getCurrentUserRole for unauthenticated users
      expect(mockGetCurrentUserRole).not.toHaveBeenCalled();
    });

    it('should refetch role when user changes', async () => {
      const mockUser1 = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result, rerender } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser1, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      // Change to different user
      const mockUser2 = { id: 'user-2', email: 'exec@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('executive');

      rerender();

      // Should refetch with new user
      await waitFor(() => {
        expect(mockGetCurrentUserRole).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Permission Boundary Tests', () => {
    it('should deny invalid role checks', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      // Test with invalid role - should return false
      expect(result.current.hasRole('invalid_role' as any)).toBe(false);
    });

    it('should handle null/undefined role securely', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockGetCurrentUserRole.mockResolvedValue(null);

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe(null);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.hasRole('administrator')).toBe(false);
      expect(result.current.hasRole('executive')).toBe(false);
      expect(result.current.hasRole('super_admin')).toBe(false);
    });

    it('should maintain role state consistency during loading', () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockGetCurrentUserRole.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      // During loading, should be in safe state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.userRole).toBe(undefined);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdministrator()).toBe(false);
      expect(result.current.isExecutive()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
    });
  });

  describe('Cache and Performance Tests', () => {
    it('should cache role data appropriately', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result, rerender } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      // Rerender should use cached data
      rerender();

      // Should only have been called once due to caching
      expect(mockGetCurrentUserRole).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent role checks efficiently', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      mockGetCurrentUserRole.mockResolvedValue('administrator');

      const { result } = renderHook(() => useUserRole(), {
        wrapper: createWrapper(mockUser, true),
      });

      await waitFor(() => {
        expect(result.current.userRole).toBe('administrator');
      });

      // Multiple role checks should be efficient
      const startTime = performance.now();

      result.current.isAdministrator();
      result.current.isExecutive();
      result.current.isSuperAdmin();
      result.current.hasRole('administrator');
      result.current.hasRole('executive');

      const endTime = performance.now();

      // Should complete quickly (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});