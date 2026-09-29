/**
 * Centralized Design Tokens for Vastré.
 * Prevents hardcoded hex codes across the app, making future dark mode or theme changes trivial.
 */
export const colors = {
  primary: '#000000', // Deep Black for editorial look
  secondary: '#F5F5F5', // Soft off-white for backgrounds
  accent: '#FF4A4A', // For destructive actions (e.g., delete)
  text: {
    primary: '#111111',
    secondary: '#767676',
    inverse: '#FFFFFF',
  },
  border: '#E5E5E5',
  status: {
    laundry: '#9E9E9E', // Grayed out for dirty clothes
    success: '#34C759',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
