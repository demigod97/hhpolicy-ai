/**
 * Feature Flags Configuration
 *
 * This file controls which features are enabled/disabled in the application.
 * Disabled features have their UI hidden but data/hooks are preserved.
 *
 * @see Story 1.19.0 - Feature Removals & Terminology Cleanup
 */

export const FEATURE_FLAGS = {
  /**
   * Notes feature - allows users to save chat messages as notes
   * Set to true to re-enable Notes UI
   * Database table (public.notes) and hooks (useNotes.tsx) remain intact
   */
  NOTES_ENABLED: false,

  /**
   * Suggested Questions - AI-generated question suggestions
   * Permanently disabled - feature code has been removed
   */
  SUGGESTED_QUESTIONS_ENABLED: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
