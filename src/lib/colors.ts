/**
 * PolicyAi Brand Colors
 * Blue and Orange color scheme
 * Color utility functions and constants
 */

export const colors = {
  // Primary Brand Color - Professional Blue
  primary: {
    DEFAULT: '#2563EB',  // Blue 600
    dark: '#1E40AF',     // Blue 800
    light: '#3B82F6',    // Blue 500
    pale: '#DBEAFE',     // Blue 100
  },

  // Neutral Colors - Professional Base
  slate: {
    DEFAULT: '#1E293B',    // Slate 800 - complements blue
    light: '#334155',      // Slate 700
    dark: '#0F172A',       // Slate 900
  },

  gray: {
    DEFAULT: '#6B7280',    // Gray 500 - neutral gray
    light: '#9CA3AF',      // Gray 400
    dark: '#374151',       // Gray 700
  },

  white: '#FFFFFF',

  // Accent Color - Orange (complements blue)
  orange: {
    DEFAULT: '#F97316',    // Orange 500
    dark: '#EA580C',       // Orange 600
    light: '#FDBA74',      // Orange 300
    pale: '#FED7AA',       // Orange 200
  },

  // Success & Positive Actions
  green: {
    DEFAULT: '#10B981',    // Emerald 500
    dark: '#059669',       // Emerald 600
    light: '#D1FAE5',      // Emerald 100
  },

  // Extended Palette for UI States
  warning: {
    DEFAULT: '#F59E0B',    // Amber 500
    light: '#FEF3C7',      // Amber 100
  },

  error: {
    DEFAULT: '#EF4444',  // Red 500 - for actual errors
    light: '#FEE2E2',    // Red 100
  },

  info: {
    DEFAULT: '#5B9BD5',
    light: '#E8F4FF',
  },
} as const;

/**
 * Get color with opacity
 * @param color - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get HSL color string from hex
 * @param hex - Hex color string
 * @returns HSL color string
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Status colors for documents
 */
export const statusColors = {
  complete: colors.green.DEFAULT,
  processing: colors.warning.DEFAULT,
  error: colors.error.DEFAULT,
  pending: colors.warmGray.DEFAULT,
} as const;

/**
 * Get status color by status string
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase() as keyof typeof statusColors;
  return statusColors[normalizedStatus] || statusColors.pending;
}
