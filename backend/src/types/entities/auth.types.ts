// Authentication types

export interface RegisterParams {
  email: string
  password: string
  nombre: string
  primerapellido: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface ForgotPasswordParams {
  email: string
}

export interface ResetPasswordParams {
  email: string
  token: string
  password: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    nombre?: string
    primerapellido?: string
  }
}
