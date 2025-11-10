/**
 * Role-Based Color Palette
 * Visual identification for different user roles
 */

export type UserRole = 'system_owner' | 'company_operator' | 'board' | 'executive' | 'administrator';

export interface RoleColors {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
}

export const rolePalette: Record<UserRole, RoleColors> = {
  system_owner: {
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    border: 'border-blue-600',
    text: 'text-blue-700',
    icon: '🔵',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  company_operator: {
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-600',
    icon: '🔵',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
  },
  board: {
    bg: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: '🟢',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
  },
  executive: {
    bg: 'bg-purple-50',
    bgHover: 'hover:bg-purple-100',
    border: 'border-purple-500',
    text: 'text-purple-700',
    icon: '🟣',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
  },
  administrator: {
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    border: 'border-amber-500',
    text: 'text-amber-700',
    icon: '🟡',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
};

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    system_owner: 'System Owner',
    company_operator: 'Company Operator',
    board: 'Board Member',
    executive: 'Executive',
    administrator: 'Administrator',
  };

  return displayNames[role] || role;
}

/**
 * Get role colors by role string
 */
export function getRoleColors(role: string): RoleColors {
  const normalizedRole = role.toLowerCase() as UserRole;
  return rolePalette[normalizedRole] || rolePalette.administrator;
}

/**
 * Get role icon by role string
 */
export function getRoleIcon(role: string): string {
  const normalizedRole = role.toLowerCase() as UserRole;
  return rolePalette[normalizedRole]?.icon || '⚪';
}

/**
 * Get role badge classes
 */
export function getRoleBadgeClasses(role: string): string {
  const colors = getRoleColors(role);
  return `${colors.badgeBg} ${colors.badgeText} ${colors.border} border-2`;
}
