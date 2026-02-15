import Constants from 'expo-constants';

/**
 * App configuration loaded from environment variables
 */
export const config = {
  apiBaseUrl: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000',
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl || '',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',

  // Google OAuth
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',

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
