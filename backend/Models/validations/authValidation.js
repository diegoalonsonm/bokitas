import { z } from 'zod'

const registerSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  }).email('Must be a valid email'),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  }).min(6, 'Password must be at least 6 characters'),
  nombre: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(2, 'Name must be at least 2 characters'),
  apellido: z.string({
    required_error: 'Last name is required',
    invalid_type_error: 'Last name must be a string'
  }).min(2, 'Last name must be at least 2 characters')
})

const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  }).email('Must be a valid email'),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  }).min(6, 'Password must be at least 6 characters')
})

const forgotPasswordSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  }).email('Must be a valid email')
})

const resetPasswordSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  }).email('Must be a valid email'),
  token: z.string({
    required_error: 'Token is required',
    invalid_type_error: 'Token must be a string'
  }).min(6, 'Token is invalid'),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  }).min(6, 'Password must be at least 6 characters')
})

export function validateRegister(data) {
  return registerSchema.safeParse(data)
}

export function validateLogin(data) {
  return loginSchema.safeParse(data)
}

export function validateForgotPassword(data) {
  return forgotPasswordSchema.safeParse(data)
}

export function validateResetPassword(data) {
  return resetPasswordSchema.safeParse(data)
}
