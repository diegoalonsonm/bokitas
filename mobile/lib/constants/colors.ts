/**
 * Bokitas Color Palette
 * Dark mode only - Costa Rica inspired warm colors
 */
export const colors = {
  // Primary brand - Warm Costa Rica inspired
  primary: '#E85D04',
  primaryLight: '#F48C06',
  primaryDark: '#DC2F02',
  
  // Secondary - Fresh tropical green
  accent: '#6A994E',
  accentLight: '#A7C957',
  
  // Dark Mode Backgrounds (no light mode)
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#262626',
  surfaceBorder: '#333333',
  
  // Dark Mode Text
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0D0D0D',
  
  // Semantic
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Rating stars
  starFilled: '#FBBF24',
  starEmpty: '#404040',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  
  // Gradients
  gradientPrimary: ['#E85D04', '#DC2F02'],
  gradientAccent: ['#6A994E', '#A7C957'],
} as const;

export type ColorKey = keyof typeof colors;
