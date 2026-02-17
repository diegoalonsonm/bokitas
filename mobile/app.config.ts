import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Bokitas',
  slug: 'bokitas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#18181B',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bokitas.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#18181B',
    },
    package: 'com.bokitas.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Bokitas to use your location to find nearby restaurants.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Bokitas to access your photos to upload profile pictures and review photos.',
        cameraPermission:
          'Allow Bokitas to access your camera to take photos for reviews.',
      },
    ],
    'expo-font',
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: true,
  },
  scheme: 'bokitas',
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'c0665162-d608-4189-9f1c-8d639edeabcf',
    },
  },
});
