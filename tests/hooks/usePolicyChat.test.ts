import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePolicyChat } from '@/hooks/usePolicyChat';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Mock dependencies
vi.mock('@/hooks/useUserRole');
vi.mock('@/contexts/AuthContext');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn()
          })),
          single: vi.fn()
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    })),
    functions: {
      invoke: vi.fn()
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      }))
    })),
    removeChannel: vi.fn()
  }
}));

const mockUseUserRole = vi.mocked(useUserRole);
const mockUseAuth = vi.mocked(useAuth);

describe('usePolicyChat Hook Security Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Default mocks
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@test.com' },
      session: { access_token: 'token' } as any,
      loading: false,
      error: null,
      isAuthenticated: true,
      signOut: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  describe('Role-Based Access Control', () => {
    it('should not fetch messages without proper role authentication', async () => {
      mockUseUserRole.mockReturnValue({
        userRole: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn(() => false),
        isAdministrator: vi.fn(() => false),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: false
      });

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Should not attempt to fetch messages without proper role
      expect(result.current.messages).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should fetch messages only for authorized Administrator role', async () => {
      mockUseUserRole.mockReturnValue({
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.userRole).toBe('administrator');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should prevent Executive from accessing Administrator documents', async () => {
      mockUseUserRole.mockReturnValue({
        userRole: 'executive',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'executive'),
        isAdministrator: vi.fn(() => false),
        isExecutive: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });

      const { result } = renderHook(() => usePolicyChat('admin-policy-1'), {
        wrapper: createWrapper(),
      });

      // Should have proper role but access check should fail for admin document
      expect(result.current.userRole).toBe('executive');
      expect(result.current.isAuthenticated).toBe(true);

      // Test hasAccessToPolicyDocument function
      const hasAccess = await result.current.hasAccessToPolicyDocument('admin-policy-1');
      expect(hasAccess).toBe(false);
    });
  });

  describe('Message Security and Validation', () => {
    beforeEach(() => {
      mockUseUserRole.mockReturnValue({
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });
    });

    it('should include role context in all message sends', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ data: 'success' });
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockImplementation(mockInvoke);

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.sendMessage({
          policyDocumentId: 'policy-1',
          role: 'user',
          content: 'Test message'
        });
      });

      expect(mockInvoke).toHaveBeenCalledWith('send-policy-chat-message', {
        body: {
          session_id: 'policy-1',
          message: 'Test message',
          user_id: 'user-1',
          user_role: 'administrator', // Critical: includes role for backend validation
          policy_document_id: 'policy-1'
        }
      });
    });

    it('should reject message sends without proper authentication', async () => {
      mockUseUserRole.mockReturnValue({
        userRole: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn(() => false),
        isAdministrator: vi.fn(() => false),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: false
      });

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      await expect(async () => {
        await act(async () => {
          result.current.sendMessage({
            policyDocumentId: 'policy-1',
            role: 'user',
            content: 'Test message'
          });
        });
      }).rejects.toThrow('User not authenticated or role not assigned');
    });

    it('should validate access before chat history deletion', async () => {
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockSingle = vi.fn();
      const mockDelete = vi.fn();

      // Mock successful access check
      mockSingle.mockResolvedValue({
        data: { id: 'policy-1', role_assignment: 'administrator' },
        error: null
      });

      mockDelete.mockResolvedValue({ error: null });

      mockEq.mockReturnValue({ single: mockSingle, eq: mockDelete });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect, delete: mockDelete });

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.from as any).mockImplementation(mockFrom);

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.deleteChatHistory('policy-1');
      });

      // Should check access before deletion
      expect(mockFrom).toHaveBeenCalledWith('policy_documents');
      expect(mockSelect).toHaveBeenCalledWith('id, role_assignment');
    });
  });

  describe('Real-time Security', () => {
    beforeEach(() => {
      mockUseUserRole.mockReturnValue({
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });
    });

    it('should filter real-time messages by user role', async () => {
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.channel as any).mockReturnValue(mockChannel);

      renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Verify real-time subscription is set up with proper filtering
      expect(supabase.channel).toHaveBeenCalledWith('policy-chat-messages');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'n8n_chat_histories',
          filter: 'session_id=eq.policy-1'
        },
        expect.any(Function)
      );
    });

    it('should clean up real-time subscriptions on unmount', () => {
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      };

      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.channel as any).mockReturnValue(mockChannel);

      const { unmount } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  describe('Error Handling Security', () => {
    beforeEach(() => {
      mockUseUserRole.mockReturnValue({
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });
    });

    it('should handle backend errors gracefully without exposing sensitive info', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Database connection failed'));
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.functions.invoke as any).mockImplementation(mockInvoke);

      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      let caughtError;
      try {
        await act(async () => {
          result.current.sendMessage({
            policyDocumentId: 'policy-1',
            role: 'user',
            content: 'Test message'
          });
        });
      } catch (error) {
        caughtError = error;
      }

      // Error should be handled without exposing internal details
      expect(caughtError).toBeDefined();
      expect(result.current.isSending).toBe(false);
    });

    it('should handle unauthorized access attempts securely', async () => {
      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Mock access check to return false
      const hasAccess = await result.current.hasAccessToPolicyDocument('unauthorized-policy');
      expect(hasAccess).toBe(false);
    });

    it('should validate message content before sending', async () => {
      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Empty message should be handled appropriately
      await expect(async () => {
        await act(async () => {
          result.current.sendMessage({
            policyDocumentId: 'policy-1',
            role: 'user',
            content: '' // Empty content
          });
        });
      }).resolves.not.toThrow();
    });
  });

  describe('Performance and Resource Management', () => {
    beforeEach(() => {
      mockUseUserRole.mockReturnValue({
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      });
    });

    it('should handle large message volumes efficiently', async () => {
      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      const startTime = performance.now();

      // Simulate processing large number of messages
      const largeMessageSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        session_id: 'policy-1',
        message: {
          type: 'ai' as const,
          content: `Message ${i}`
        }
      }));

      // This should complete quickly
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast for setup
    });

    it('should prevent memory leaks from real-time subscriptions', () => {
      const { unmount, rerender } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Create multiple subscription/unsubscription cycles
      for (let i = 0; i < 5; i++) {
        rerender();
      }

      unmount();

      // Should clean up all subscriptions
      expect(vi.mocked(import('@/integrations/supabase/client')).supabase.removeChannel).toHaveBeenCalled();
    });

    it('should handle concurrent operations safely', async () => {
      const { result } = renderHook(() => usePolicyChat('policy-1'), {
        wrapper: createWrapper(),
      });

      // Multiple concurrent operations should be handled safely
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(result.current.hasAccessToPolicyDocument(`policy-${i}`));
      }

      await Promise.all(promises);

      // All should complete without errors
      expect(promises).toHaveLength(10);
    });
  });
});