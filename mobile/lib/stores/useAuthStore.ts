import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { authApi } from '@/lib/api/endpoints/auth';
import { TOKEN_KEYS, clearTokens } from '@/lib/api/client';
import { config } from '@/lib/constants/config';
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    // Fetch full user profile
    const meResponse = await authApi.me();
    if (meResponse.success && meResponse.data) {
      set({ user: meResponse.data, isAuthenticated: true });
    }
  },

  loginWithGoogle: async () => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: config.googleWebClientId,
      offlineAccess: true,
    });

    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new Error('Google sign-in failed: no ID token received');
    }

    const loginResponse = await authApi.loginWithGoogle(response.data.idToken);

    if (!loginResponse.success || !loginResponse.data) {
      throw new Error(loginResponse.error?.message || 'Google login failed');
    }

    // Fetch full user profile
    const meResponse = await authApi.me();
    if (meResponse.success && meResponse.data) {
      set({ user: meResponse.data, isAuthenticated: true });
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      const expiresAt = await SecureStore.getItemAsync(TOKEN_KEYS.EXPIRES_AT);

      if (!token || !expiresAt) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }

      // Check if token is expired
      const isExpired = Date.now() / 1000 >= parseInt(expiresAt) - 60;
      if (isExpired) {
        await clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }

      // Fetch current user
      const response = await authApi.me();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        await clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch (error) {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  refreshUser: async () => {
    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        set({ user: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
