import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/lib/constants/config';
import { ApiResponse, ApiError } from '@/types/api';

/**
 * Axios instance configured for Bokitas API
 */
export const api: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
} as const;

/**
 * Check if the current access token is expired
 */
export async function isTokenExpired(): Promise<boolean> {
  const expiresAt = await SecureStore.getItemAsync(TOKEN_KEYS.EXPIRES_AT);
  if (!expiresAt) return true;
  
  const bufferSeconds = 60; // 1 minute buffer
  return Date.now() / 1000 >= parseInt(expiresAt) - bufferSeconds;
}

/**
 * Get the current access token
 */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * Save auth tokens to secure storage
 */
export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
    SecureStore.setItemAsync(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString()),
  ]);
}

/**
 * Clear all auth tokens from secure storage
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(TOKEN_KEYS.EXPIRES_AT),
  ]);
}

/**
 * Request interceptor - Add auth token to protected requests
 */
api.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      await clearTokens();
      // Note: Navigation to login will be handled by AuthContext
    }
    return Promise.reject(error);
  }
);

/**
 * Type-safe API request helper
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: unknown,
  requiresAuth: boolean = false
): Promise<ApiResponse<T>> {
  try {
    if (requiresAuth && await isTokenExpired()) {
      throw new Error('Token expired');
    }

    const response = await api.request<ApiResponse<T>>({
      method,
      url: endpoint,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  }
}

/**
 * Upload file helper (for photos)
 */
export async function uploadFile<T>(
  endpoint: string,
  file: { uri: string; name: string; type: string },
  fieldName: string = 'photo'
): Promise<ApiResponse<T>> {
  try {
    const formData = new FormData();
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await api.post<ApiResponse<T>>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to upload file',
      },
    };
  }
}
