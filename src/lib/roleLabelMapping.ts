/**
 * Role Label Mapping Utility
 *
 * Maps internal database role names to user-friendly display labels.
 * Key terminology change: "administrator" -> "General" (general staff access)
 *
 * @see Story 1.19.0 - Feature Removals & Terminology Cleanup
 * @see docs/ux-ui-specification.md - Role-Based Color Coding
 */

/**
 * Maps database role names to user-friendly display labels
 */
export const ROLE_DISPLAY_LABELS: Record<string, string> = {
  system_owner: 'System Owner',
  company_operator: 'Company Operator',
  administrator: 'General', // KEY CHANGE: "Administrator" -> "General" for clarity
  executive: 'Executive',
  board: 'Board',
};

/**
 * Maps role names to descriptions explaining their access level
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  system_owner: 'Developer/backend access',
  company_operator: 'Document and user management',
  administrator: 'General staff access',
  executive: 'C-Level and VP access',
  board: 'Board member access',
};

/**
 * Get the user-friendly display label for a role
 * @param role - The database role name
 * @returns The display label (or the original role if not mapped)
 */
export function getRoleDisplayLabel(role: string): string {
  return ROLE_DISPLAY_LABELS[role] || role;
}

/**
 * Get the description for a role
 * @param role - The database role name
 * @returns The role description (or empty string if not mapped)
 */
export function getRoleDescription(role: string): string {
  return ROLE_DESCRIPTIONS[role] || '';
}

/**
 * Get all available roles with their labels
 * @returns Array of { value, label } objects for use in select components
 */
export function getRoleOptions(): Array<{ value: string; label: string; description: string }> {
  return Object.entries(ROLE_DISPLAY_LABELS).map(([value, label]) => ({
    value,
    label,
    description: ROLE_DESCRIPTIONS[value] || '',
  }));
}
