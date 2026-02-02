import { apiRequest, saveTokens, clearTokens } from '../client';
import { User, RegisterData } from '@/types';
import { ApiResponse } from '@/types/api';
import { mapUser, RawUser } from '@/lib/utils/mappers';

/**
 * Raw login response from Supabase backend
 */
interface RawLoginResponse {
  user: RawUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

/**
 * Internal login response with mapped user
 */
export interface LoginResult {
  user: User;
}

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ id: string; email: string }>> {
    return apiRequest<{ id: string; email: string }>('POST', '/auth/register', data);
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResult>> {
    const response = await apiRequest<RawLoginResponse>('POST', '/auth/login', {
      email,
      password,
    });

    // Save tokens and map user if login successful
    if (response.success && response.data?.session) {
      const { session, user: rawUser } = response.data;
      await saveTokens(
        session.access_token,
        session.refresh_token,
        session.expires_at
      );
      
      return {
        ...response,
        data: {
          user: mapUser(rawUser),
        },
      };
    }

    return {
      ...response,
      data: undefined,
    };
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/auth/logout', {}, true);
    } catch (error) {
      // Continue with local logout even if API fails
      console.warn('Logout API call failed:', error);
    }
    await clearTokens();
  },

  /**
   * Get current authenticated user's profile
   */
  async me(): Promise<ApiResponse<User>> {
    const response = await apiRequest<RawUser>('GET', '/auth/me', undefined, true);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapUser(response.data),
      };
    }
    
    return {
      ...response,
      data: undefined,
    };
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiRequest<void>('POST', '/auth/forgot-password', { email });
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(
    email: string,
    token: string,
    password: string
  ): Promise<ApiResponse<void>> {
    return apiRequest<void>('POST', '/auth/reset-password', {
      email,
      token,
      password,
    });
  },
};
