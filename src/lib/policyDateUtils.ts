/**
 * Utility functions for handling policy dates and calculating age/outdated status
 */

/**
 * Parse a policy date string in "Month-Year" format (e.g., "February-2024")
 * @param policyDateStr - Date string in format "Month-Year" or "Month-YYYY"
 * @returns Date object or null if invalid
 */
export function parsePolicyDate(policyDateStr: string | null | undefined): Date | null {
  if (!policyDateStr) return null;

  try {
    // Split by hyphen or dash
    const parts = policyDateStr.trim().split(/[-–]/);
    if (parts.length !== 2) return null;

    const [monthStr, yearStr] = parts;

    // Parse year
    const year = parseInt(yearStr.trim(), 10);
    if (isNaN(year) || year < 1900 || year > 2100) return null;

    // Parse month name to month number
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    const monthIndex = monthNames.findIndex(
      name => name === monthStr.toLowerCase().trim()
    );

    if (monthIndex === -1) return null;

    // Create date on the first day of the month
    return new Date(year, monthIndex, 1);
  } catch (error) {
    console.error('Error parsing policy date:', error);
    return null;
  }
}

/**
 * Calculate the age of a policy in months
 * @param policyDateStr - Date string in format "Month-Year"
 * @returns Age in months or null if invalid
 */
export function getPolicyAgeInMonths(policyDateStr: string | null | undefined): number | null {
  const policyDate = parsePolicyDate(policyDateStr);
  if (!policyDate) return null;

  const now = new Date();

  // Calculate difference in months
  const yearDiff = now.getFullYear() - policyDate.getFullYear();
  const monthDiff = now.getMonth() - policyDate.getMonth();

  return yearDiff * 12 + monthDiff;
}

/**
 * Check if a policy is outdated (older than 18 months)
 * @param policyDateStr - Date string in format "Month-Year"
 * @param thresholdMonths - Number of months after which policy is considered outdated (default: 18)
 * @returns true if outdated, false if current, null if date is invalid
 */
export function isPolicyOutdated(
  policyDateStr: string | null | undefined,
  thresholdMonths: number = 18
): boolean | null {
  const ageInMonths = getPolicyAgeInMonths(policyDateStr);
  if (ageInMonths === null) return null;

  return ageInMonths > thresholdMonths;
}

/**
 * Get a human-readable age description for a policy
 * @param policyDateStr - Date string in format "Month-Year"
 * @returns Human-readable age (e.g., "3 months old", "2 years old")
 */
export function getPolicyAgeDescription(policyDateStr: string | null | undefined): string | null {
  const ageInMonths = getPolicyAgeInMonths(policyDateStr);
  if (ageInMonths === null) return null;

  if (ageInMonths === 0) return 'Current month';
  if (ageInMonths === 1) return '1 month old';
  if (ageInMonths < 12) return `${ageInMonths} months old`;

  const years = Math.floor(ageInMonths / 12);
  const remainingMonths = ageInMonths % 12;

  if (years === 1 && remainingMonths === 0) return '1 year old';
  if (years === 1) return `1 year, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} old`;
  if (remainingMonths === 0) return `${years} years old`;

  return `${years} years, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} old`;
}

/**
 * Format a policy date for display
 * @param policyDateStr - Date string in format "Month-Year"
 * @returns Formatted date string (e.g., "Feb 2024") or original if invalid
 */
export function formatPolicyDate(policyDateStr: string | null | undefined): string {
  if (!policyDateStr) return 'Unknown';

  const policyDate = parsePolicyDate(policyDateStr);
  if (!policyDate) return policyDateStr; // Return original if can't parse

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[policyDate.getMonth()];
  const year = policyDate.getFullYear();

  return `${month} ${year}`;
}
