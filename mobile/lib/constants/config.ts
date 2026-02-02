import Constants from 'expo-constants';

/**
 * App configuration loaded from environment variables
 */
export const config = {
  apiBaseUrl: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000',
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl || '',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
  
  // App info
  appName: 'Bokitas',
  appVersion: Constants.expoConfig?.version || '1.0.0',
  
  // Timeouts
  apiTimeout: 10000, // 10 seconds
  
  // Pagination defaults
  defaultPageSize: 20,
  
  // Image upload limits
  maxProfilePhotoSize: 5 * 1024 * 1024, // 5MB
  maxReviewPhotoSize: 10 * 1024 * 1024, // 10MB
  imageCompressQuality: 0.7,
  imageMaxWidth: 1200,
} as const;
