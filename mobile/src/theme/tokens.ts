/**
 * Centralized Design Tokens for Vastré.
 * Prevents hardcoded hex codes across the app, making future dark mode or theme changes trivial.
 */
export const lightColors = {
  primary: '#34251E',
  secondary: '#F5EFE6',
  accent: '#702E3B',
  card: '#E9DED1',
  surface: '#FFFFFF',
  taupe: '#817466',
  text: {
    primary: '#34251E',
    secondary: '#817466',
    inverse: '#FFFFFF',
  },
  border: '#D9CDBF',
  banner: '#34251E',
  onBanner: '#F5EFE6',
  status: {
    laundry: '#817466',
    success: '#6B7355',
  }
} as const;

export const darkColors = {
  primary: '#F0E5D9',
  secondary: '#1E1916',
  accent: '#C57B87',
  card: '#332923',
  surface: '#332923',
  taupe: '#B7A899',
  text: {
    primary: '#F0E5D9',
    secondary: '#B7A899',
    inverse: '#1E1916',
  },
  border: '#4A3B32',
  banner: '#38262A',
  onBanner: '#F0E5D9',
  status: {
    laundry: '#B7A899',
    success: '#ADB990',
  },
} as const;

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  surface: string;
  taupe: string;
  text: { primary: string; secondary: string; inverse: string };
  border: string;
  banner: string;
  onBanner: string;
  status: { laundry: string; success: string };
};
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
