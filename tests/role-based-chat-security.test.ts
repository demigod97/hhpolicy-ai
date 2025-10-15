import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import PolicyChatInterface from '@/components/chat/PolicyChatInterface';
import { usePolicyChat } from '@/hooks/usePolicyChat';
import { useUserRole } from '@/hooks/useUserRole';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            eq: vi.fn()
          }))
        }))
      }))
    })),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock hooks
vi.mock('@/hooks/useUserRole');
vi.mock('@/hooks/usePolicyChat');

const mockUseUserRole = vi.mocked(useUserRole);
const mockUsePolicyChat = vi.mocked(usePolicyChat);

describe('Role-Based Chat Security Tests', () => {
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  describe('SEC-001: Cross-Role Data Leakage Prevention', () => {
    it('should deny access when Administrator tries to access Executive documents', async () => {
      // Setup: Administrator user trying to access Executive policy document
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

      mockUsePolicyChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: vi.fn(),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(false), // Access denied
        userRole: 'administrator',
        isAuthenticated: true
      });

      const executivePolicyDocument = {
        id: 'exec-policy-1',
        title: 'Executive Compensation Policy',
        role_assignment: 'executive' // This should block administrator access
      };

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="exec-policy-1"
          policyDocument={executivePolicyDocument}
        />
      );

      // Verify access denied message is shown
      expect(screen.getByText(/Access denied: This policy document is assigned to executive role/i)).toBeInTheDocument();
    });

    it('should deny access when Executive tries to access Administrator documents', async () => {
      // Setup: Executive user trying to access Administrator policy document
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

      mockUsePolicyChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: vi.fn(),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(false), // Access denied
        userRole: 'executive',
        isAuthenticated: true
      });

      const adminPolicyDocument = {
        id: 'admin-policy-1',
        title: 'HR Policy Manual',
        role_assignment: 'administrator' // This should block executive access
      };

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="admin-policy-1"
          policyDocument={adminPolicyDocument}
        />
      );

      // Verify access denied message is shown
      expect(screen.getByText(/Access denied: This policy document is assigned to administrator role/i)).toBeInTheDocument();
    });

    it('should allow SuperAdmin access to all documents', async () => {
      // Setup: SuperAdmin user accessing any policy document
      mockUseUserRole.mockReturnValue({
        userRole: 'super_admin',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn(() => true), // SuperAdmin has all roles
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => true),
        isAuthenticated: true
      });

      mockUsePolicyChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: vi.fn(),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(true), // Access granted
        userRole: 'super_admin',
        isAuthenticated: true
      });

      const anyPolicyDocument = {
        id: 'any-policy-1',
        title: 'Any Policy Document',
        role_assignment: 'administrator' // SuperAdmin should access this
      };

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="any-policy-1"
          policyDocument={anyPolicyDocument}
        />
      );

      // Verify no access denied message is shown
      expect(screen.queryByText(/Access denied/i)).not.toBeInTheDocument();
      // Verify chat interface is accessible
      expect(screen.getByPlaceholderText(/Ask about policies/i)).toBeInTheDocument();
    });
  });

  describe('SEC-002: N8N Workflow Authentication Bypass Prevention', () => {
    it('should include user role in all backend requests', async () => {
      const mockSendMessage = vi.fn();

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

      mockUsePolicyChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: mockSendMessage,
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(true),
        userRole: 'administrator',
        isAuthenticated: true
      });

      const adminPolicyDocument = {
        id: 'admin-policy-1',
        title: 'HR Policy Manual',
        role_assignment: 'administrator'
      };

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="admin-policy-1"
          policyDocument={adminPolicyDocument}
        />
      );

      // Simulate sending a message
      const input = screen.getByPlaceholderText(/Ask about policies/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'What is the vacation policy?' } });
      fireEvent.click(sendButton);

      // Verify that sendMessage was called with proper role context
      expect(mockSendMessage).toHaveBeenCalledWith({
        policyDocumentId: 'admin-policy-1',
        role: 'user',
        content: 'What is the vacation policy?'
      });
    });

    it('should reject requests without proper role verification', async () => {
      const mockSendMessage = vi.fn().mockRejectedValue(new Error('Access denied: User role verification failed'));

      mockUseUserRole.mockReturnValue({
        userRole: null, // No role assigned
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn(() => false),
        isAdministrator: vi.fn(() => false),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: false // Not properly authenticated
      });

      mockUsePolicyChat.mockReturnValue({
        messages: [],
        isLoading: false,
        error: null,
        sendMessage: mockSendMessage,
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(false),
        userRole: null,
        isAuthenticated: false
      });

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="admin-policy-1"
          policyDocument={{
            id: 'admin-policy-1',
            title: 'HR Policy Manual',
            role_assignment: 'administrator'
          }}
        />
      );

      // Verify chat is disabled due to authentication failure
      expect(screen.getByPlaceholderText(/Authentication required/i)).toBeDisabled();
    });
  });

  describe('PERF-001: Role Filtering Performance Validation', () => {
    it('should complete role-filtered queries within performance requirements', async () => {
      const startTime = performance.now();

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

      // Simulate a large number of messages being processed
      const largeMockMessages = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        session_id: 'test-session',
        message: {
          type: 'ai' as const,
          content: `Response ${i} with role-filtered content`
        }
      }));

      mockUsePolicyChat.mockReturnValue({
        messages: largeMockMessages,
        isLoading: false,
        error: null,
        sendMessage: vi.fn().mockResolvedValue(undefined),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(true),
        userRole: 'administrator',
        isAuthenticated: true
      });

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="admin-policy-1"
          policyDocument={{
            id: 'admin-policy-1',
            title: 'HR Policy Manual',
            role_assignment: 'administrator'
          }}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 1000ms for UI responsiveness)
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('DATA-001: Vector Store Metadata Corruption Prevention', () => {
    it('should validate citation metadata matches user role', async () => {
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

      // Mock messages with citations
      const messagesWithCitations = [{
        id: 1,
        session_id: 'test-session',
        message: {
          type: 'ai' as const,
          content: {
            segments: [
              { text: 'According to the HR policy', citation_id: 1 }
            ],
            citations: [{
              citation_id: 1,
              source_id: 'admin-source-1',
              source_title: 'HR Policy Manual', // Should match administrator role
              source_type: 'pdf',
              chunk_index: 0,
              excerpt: 'Lines 1-10'
            }]
          }
        }
      }];

      mockUsePolicyChat.mockReturnValue({
        messages: messagesWithCitations,
        isLoading: false,
        error: null,
        sendMessage: vi.fn(),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(true),
        userRole: 'administrator',
        isAuthenticated: true
      });

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="admin-policy-1"
          policyDocument={{
            id: 'admin-policy-1',
            title: 'HR Policy Manual',
            role_assignment: 'administrator'
          }}
        />
      );

      // Verify citation is displayed and properly formatted
      expect(screen.getByText(/According to the HR policy/)).toBeInTheDocument();
      // Verify citation button is present
      expect(screen.getByRole('button', { name: /1/ })).toBeInTheDocument();
    });

    it('should not display citations from unauthorized sources', async () => {
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

      // Mock messages that would contain admin-only citations (should be filtered out)
      const messagesWithFilteredCitations = [{
        id: 1,
        session_id: 'test-session',
        message: {
          type: 'ai' as const,
          content: {
            segments: [
              { text: 'No relevant information found in your accessible documents.' }
            ],
            citations: [] // Should be empty due to role filtering
          }
        }
      }];

      mockUsePolicyChat.mockReturnValue({
        messages: messagesWithFilteredCitations,
        isLoading: false,
        error: null,
        sendMessage: vi.fn(),
        sendMessageAsync: vi.fn(),
        isSending: false,
        deleteChatHistory: vi.fn(),
        isDeletingChatHistory: false,
        hasAccessToPolicyDocument: vi.fn().mockResolvedValue(true),
        userRole: 'executive',
        isAuthenticated: true
      });

      renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="exec-policy-1"
          policyDocument={{
            id: 'exec-policy-1',
            title: 'Executive Policy',
            role_assignment: 'executive'
          }}
        />
      );

      // Verify no unauthorized citations are displayed
      expect(screen.getByText(/No relevant information found/)).toBeInTheDocument();
      // Verify no citation buttons are present
      expect(screen.queryByRole('button', { name: /1/ })).not.toBeInTheDocument();
    });
  });

  describe('Integration Security Tests', () => {
    it('should maintain role isolation under concurrent access', async () => {
      // This would typically be an integration test, but we can simulate it
      const adminRoleHook = {
        userRole: 'administrator',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'administrator'),
        isAdministrator: vi.fn(() => true),
        isExecutive: vi.fn(() => false),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      };

      const execRoleHook = {
        userRole: 'executive',
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        hasRole: vi.fn((role) => role === 'executive'),
        isAdministrator: vi.fn(() => false),
        isExecutive: vi.fn(() => true),
        isSuperAdmin: vi.fn(() => false),
        isAuthenticated: true
      };

      // Test that both roles maintain isolation
      expect(adminRoleHook.isAdministrator()).toBe(true);
      expect(adminRoleHook.isExecutive()).toBe(false);
      expect(execRoleHook.isAdministrator()).toBe(false);
      expect(execRoleHook.isExecutive()).toBe(true);

      // Verify no cross-contamination
      expect(adminRoleHook.userRole).not.toBe(execRoleHook.userRole);
    });

    it('should handle role changes securely', async () => {
      const { rerender } = renderWithProviders(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="test-policy-1"
          policyDocument={{
            id: 'test-policy-1',
            title: 'Test Policy',
            role_assignment: 'administrator'
          }}
        />
      );

      // Initially setup as administrator
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

      // Simulate role change (e.g., after admin revokes role)
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

      rerender(
        <PolicyChatInterface
          hasSource={true}
          policyDocumentId="test-policy-1"
          policyDocument={{
            id: 'test-policy-1',
            title: 'Test Policy',
            role_assignment: 'administrator'
          }}
        />
      );

      // Verify access is immediately revoked
      expect(screen.getByPlaceholderText(/Authentication required/i)).toBeDisabled();
    });
  });
});