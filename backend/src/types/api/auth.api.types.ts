import type { Request } from 'express'

// Auth API request types

export interface RegisterBody {
  email: string
  password: string
  nombre: string
  apellido: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface ForgotPasswordBody {
  email: string
}

export interface ResetPasswordBody {
  email: string
  token: string
  password: string
}

export interface RegisterRequest extends Request {
  body: RegisterBody
}

export interface LoginRequest extends Request {
  body: LoginBody
}

export interface ForgotPasswordRequest extends Request {
  body: ForgotPasswordBody
}

export interface ResetPasswordRequest extends Request {
  body: ResetPasswordBody
}
