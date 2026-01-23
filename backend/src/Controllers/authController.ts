import type { Response } from 'express'
import { type Request } from 'express'
import { supabase } from '../Models/supabase/client.js'
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../Models/validations/authValidation.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'

export class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const { email, password, nombre, primerapellido } = req.body

      const validation = validateRegister({ email, password, nombre, primerapellido })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
        return
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
          res.status(409).json({
            success: false,
            error: {
              code: 'CONFLICT',
              message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
            }
          })
          return
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
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /auth/login
   * Login user
   */
  static async login(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const { email, password } = req.body

      const validation = validateLogin({ email, password })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Supabase sign in error:', signInError)
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: ERROR_MESSAGES.INVALID_CREDENTIALS
          }
        })
        return
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
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /auth/logout
   * Logout user
   */
  static async logout(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing authorization header'
          }
        })
        return
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
    } catch (err) {
      console.error('Logout error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /auth/forgot-password
   * Request password reset email
   */
  static async forgotPassword(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const { email } = req.body

      const validation = validateForgotPassword({ email })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
        return
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
    } catch (err) {
      console.error('Forgot password error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const { email, token, password } = req.body

      const validation = validateResetPassword({ email, token, password })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
        return
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
    } catch (err) {
      console.error('Reset password error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * GET /auth/me
   * Get current authenticated user info
   */
  static async me(req: Request, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          }
        })
        return
      }

      const { data: user, error } = await supabase
        .from('usuario')
        .select('id, email, nombre, primerapellido, createdat, urlfotoperfil, idestado, active')
        .eq('id', userId)
        .eq('active', true)
        .single()

      if (error || !user) {
        throw new Error('Failed to fetch user')
      }

      res.status(200).json({
        success: true,
        data: user
      })
    } catch (err) {
      console.error('Get me error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (err as Error).message
        }
      })
    }
  }
}
