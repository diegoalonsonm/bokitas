/**
 * Authentication Types
 */

import type { User } from './entities/user.types';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterData {
    email: string;
    password: string;
    nombre: string;
    primerapellido: string;
}
