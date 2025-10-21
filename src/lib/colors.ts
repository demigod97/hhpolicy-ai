/**
 * Human Habitat Brand Colors
 * Color utility functions and constants
 */

export const colors = {
  // Primary Brand Color - Human Habitat Red
  primary: {
    DEFAULT: '#EE4433',
    dark: '#CC3322',
    light: '#FF6655',
    pale: '#FFE8E5',
  },

  // Neutral Colors - Professional Base
  charcoal: {
    DEFAULT: '#333322',
    light: '#4A4A38',
    dark: '#1A1A11',
  },

  warmGray: {
    DEFAULT: '#BBBBAA',
    light: '#D5D5C8',
    dark: '#9A9A88',
  },

  white: '#FFFFFF',

  // Accent Color - Success & Positive Actions
  green: {
    DEFAULT: '#77CC99',
    dark: '#5FAA7F',
    light: '#E5F7EE',
  },

  // Extended Palette for UI States
  warning: {
    DEFAULT: '#FFB84D',
    light: '#FFF3E0',
  },

  error: {
    DEFAULT: '#EE4433',
    light: '#FFE8E5',
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
