import { useAuthStore } from '@/lib/stores/useAuthStore';

/**
 * Hook to access auth state and actions
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
    refreshUser,
  };
}
