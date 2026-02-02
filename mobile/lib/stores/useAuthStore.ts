import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { TOKEN_KEYS, clearTokens } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
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
