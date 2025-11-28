// User profile types for Settings page

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  role: UserRoleType;
  created_at: string;
  updated_at: string;
}

export type UserRoleType =
  | 'system_owner'
  | 'company_operator'
  | 'administrator'
  | 'executive'
  | 'board';

export interface UpdateProfileRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// Role display configuration
export const ROLE_DISPLAY_NAMES: Record<UserRoleType, string> = {
  system_owner: 'System Owner',
  company_operator: 'Company Operator',
  administrator: 'General (Administrator)',
  executive: 'Executive',
  board: 'Board',
};

export const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  system_owner: 'Full system access and configuration',
  company_operator: 'Document and user management',
  administrator: 'Standard staff access to general documents',
  executive: 'Access to general and executive documents',
  board: 'Access to all documents including board-level',
};

// Role badge colors matching the existing design system
export const ROLE_BADGE_COLORS: Record<UserRoleType, { bg: string; text: string }> = {
  system_owner: { bg: 'bg-purple-100', text: 'text-purple-800' },
  company_operator: { bg: 'bg-blue-100', text: 'text-blue-800' },
  administrator: { bg: 'bg-green-100', text: 'text-green-800' },
  executive: { bg: 'bg-amber-100', text: 'text-amber-800' },
  board: { bg: 'bg-red-100', text: 'text-red-800' },
};
