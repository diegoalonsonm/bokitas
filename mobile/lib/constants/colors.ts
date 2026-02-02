/**
 * Bokitas Color Palette
 * Dark mode only - Modern charcoal with vibrant coral accents
 */
export const colors = {
  // Primary brand - Vibrant Coral
  primary: '#FF6B6B',
  primaryLight: '#FF8A8A',
  primaryDark: '#E85555',
  
  // Secondary - Cool Gray (for subtitles, placeholders)
  accent: '#A1A1AA',
  accentLight: '#D4D4D8',
  
  // Dark Mode Backgrounds - Soft Charcoal / Deep Slate
  background: '#18181B',
  surface: '#27272A',
  surfaceElevated: '#3F3F46',
  surfaceBorder: '#3F3F46',
  
  // Dark Mode Text
  text: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#18181B',
  
  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Rating stars
  starFilled: '#FBBF24',
  starEmpty: '#3F3F46',
  
  // Overlays
  overlay: 'rgba(24, 24, 27, 0.8)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
  
  // Gradients
  gradientPrimary: ['#FF6B6B', '#E85555'],
  gradientAccent: ['#A1A1AA', '#D4D4D8'],
} as const;

export type ColorKey = keyof typeof colors;
