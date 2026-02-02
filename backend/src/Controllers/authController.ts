import type { Response } from 'express'
import { type Request } from 'express'
import { supabase } from '../Models/supabase/client.js'
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../Models/validations/authValidation.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError
} from '../Middleware/errorMiddleware.js'

export class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, nombre, primerapellido } = req.body

    const validation = validateRegister({ email, password, nombre, primerapellido })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          primerapellido
        }
      }
    })

    if (signUpError) {
      console.error('Supabase sign up error:', signUpError)
      if (signUpError.message.includes('already registered')) {
        throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
      }
      throw signUpError
    }

    if (!signUpData.user) {
      throw new Error('Failed to create user')
    }

    // Return the user data from Supabase Auth response
    // The usuario table record is created by a database trigger
    res.status(200).json({
      success: true,
      data: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        nombre,
        primerapellido
      }
    })
  }

  /**
   * POST /auth/login
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    const validation = validateLogin({ email, password })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      console.error('Supabase sign in error:', signInError)
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const { data: { session } } = await supabase.auth.getSession()

    res.status(200).json({
      success: true,
      data: {
        user: data.user,
        session: {
          access_token: session?.access_token || '',
          refresh_token: session?.refresh_token || '',
          expires_at: session?.expires_at || 0
        }
      }
    })
  }

  /**
   * POST /auth/logout
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedError('Missing authorization header')
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase sign out error:', error)
      throw error
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  }

  /**
   * POST /auth/forgot-password
   * Request password reset email
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body

    const validation = validateForgotPassword({ email })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN}/auth/reset-password`
    })

    if (error) {
      console.error('Password reset request error:', error)
      throw error
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent if email exists'
    })
  }

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, token, password } = req.body

    const validation = validateResetPassword({ email, token, password })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error('Password reset error:', error)
      throw error
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })
  }

  /**
   * GET /auth/me
   * Get current authenticated user info
   */
  static async me(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, correo, nombre, primerapellido, createdat, urlfotoperfil, idestado, active')
      .eq('authid', userId)
      .eq('active', true)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    if (!user) {
      throw new NotFoundError('User not found')
    }

    res.status(200).json({
      success: true,
      data: user
    })
  }
}
