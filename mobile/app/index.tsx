import { Redirect, Href } from 'expo-router';
import { useAuthStore } from '@/lib/stores';

/**
 * Entry point - redirects based on auth state
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Wait for auth check to complete
  if (isLoading) {
    return null;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href={'/(tabs)/(home,search)/home' as Href} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
