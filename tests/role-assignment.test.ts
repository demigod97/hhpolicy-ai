import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  assignUserRole,
  getUserRoles,
  hasRole,
  isSuperAdmin,
  getCurrentUserRole,
  UserRole
} from '../src/services/authService';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    admin: {
      getUserById: vi.fn(),
    },
  },
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('../src/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Role Assignment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assignUserRole', () => {
    it('should successfully assign a role to a user', async () => {
      // Mock session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
          },
        },
      });

      // Mock successful response
      const mockResponse = {
        data: {
          success: true,
          message: 'Successfully assigned administrator role to user',
          data: {
            id: 'role-id',
            user_id: 'user-id',
            role: 'administrator',
            created_at: '2025-09-18T00:00:00Z',
            updated_at: '2025-09-18T00:00:00Z',
          },
        },
        error: null,
      };

      mockSupabase.functions.invoke.mockResolvedValue(mockResponse);

      const result = await assignUserRole({
        user_id: 'user-id',
        role: 'administrator',
        action: 'assign',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully assigned administrator role to user');
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('assign-user-role', {
        body: {
          user_id: 'user-id',
          role: 'administrator',
          action: 'assign',
        },
        headers: {
          Authorization: 'Bearer mock-token',
        },
      });
    });

    it('should throw error when not authenticated', async () => {
      // Mock no session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      await expect(assignUserRole({
        user_id: 'user-id',
        role: 'administrator',
        action: 'assign',
      })).rejects.toThrow('Not authenticated');
    });

    it('should handle function invocation errors', async () => {
      // Mock session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
          },
        },
      });

      // Mock error response
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('Function error'),
      });

      await expect(assignUserRole({
        user_id: 'user-id',
        role: 'administrator',
        action: 'assign',
      })).rejects.toThrow('Function error');
    });
  });

  describe('getUserRoles', () => {
    it('should fetch roles for a specific user', async () => {
      const mockRoles = [
        {
          id: 'role-1',
          user_id: 'user-id',
          role: 'administrator',
          created_at: '2025-09-18T00:00:00Z',
          updated_at: '2025-09-18T00:00:00Z',
        },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockRoles,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getUserRoles('user-id');

      expect(result).toEqual(mockRoles);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_roles');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-id');
    });

    it('should fetch all roles when no userId specified', async () => {
      const mockRoles = [
        {
          id: 'role-1',
          user_id: 'user-1',
          role: 'administrator',
          created_at: '2025-09-18T00:00:00Z',
          updated_at: '2025-09-18T00:00:00Z',
        },
        {
          id: 'role-2',
          user_id: 'user-2',
          role: 'executive',
          created_at: '2025-09-18T00:00:00Z',
          updated_at: '2025-09-18T00:00:00Z',
        },
      ];

      const mockQuery = {
        order: vi.fn().mockResolvedValue({
          data: mockRoles,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getUserRoles();

      expect(result).toEqual(mockRoles);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_roles');
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      await expect(getUserRoles()).rejects.toThrow('Database error');
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-id' },
        },
      });

      // Mock role query
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'role-id' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await hasRole('administrator');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_roles');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-id');
      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'administrator');
    });

    it('should return false when user does not have the specified role', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-id' },
        },
      });

      // Mock no role found
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No rows returned
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await hasRole('administrator');

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      // Mock no authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await hasRole('administrator');

      expect(result).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true when user is super admin', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-id' },
        },
      });

      // Mock super admin role
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'role-id' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await isSuperAdmin();

      expect(result).toBe(true);
      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'super_admin');
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return highest priority role', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-id' },
        },
      });

      // Mock multiple roles
      const mockRoles = [
        { role: 'executive' },
        { role: 'administrator' },
        { role: 'super_admin' },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockRoles,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getCurrentUserRole();

      expect(result).toBe('super_admin'); // Highest priority
    });

    it('should return null when user has no roles', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-id' },
        },
      });

      // Mock no roles
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });

      const result = await getCurrentUserRole();

      expect(result).toBeNull();
    });

    it('should return null when user is not authenticated', async () => {
      // Mock no authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await getCurrentUserRole();

      expect(result).toBeNull();
    });
  });
});

describe('Role Hierarchy', () => {
  it('should prioritize roles correctly', () => {
    const roleHierarchy: UserRole[] = ['super_admin', 'administrator', 'executive'];

    expect(roleHierarchy.indexOf('super_admin')).toBeLessThan(roleHierarchy.indexOf('administrator'));
    expect(roleHierarchy.indexOf('administrator')).toBeLessThan(roleHierarchy.indexOf('executive'));
  });

  it('should validate role types', () => {
    const validRoles: UserRole[] = ['administrator', 'executive', 'super_admin'];

    validRoles.forEach(role => {
      expect(['administrator', 'executive', 'super_admin']).toContain(role);
    });
  });
});