import { supabase } from '../Models/supabase/client.js'
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../Models/validations/authValidation.js'
import { ESTADO, ERROR_MESSAGES } from '../Utils/constants.js'

export class AuthController {
  static async register(req, res) {
    try {
      const { email, password, nombre, apellido } = req.body

      const validation = validateRegister({ email, password, nombre, apellido })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido
          }
        }
      })

      if (signUpError) {
        console.error('Supabase sign up error:', signUpError)
        if (signUpError.message.includes('already registered')) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'CONFLICT',
              message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
            }
          })
        }
        throw signUpError
      }

      const { data: { user }, error: userError } = await supabase
        .from('usuario')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !user) {
        throw new Error('Failed to create user record')
      }

      res.status(200).json({
        success: true,
        data: { id: user.id, email: user.email, nombre: user.nombre, apellido: user.apellido }
      })
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message
        }
      })
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body

      const validation = validateLogin({ email, password })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Supabase sign in error:', signInError)
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: ERROR_MESSAGES.INVALID_CREDENTIALS
          }
        })
      }

      const { data: { session } } = await supabase.auth.getSession()

      res.status(200).json({
        success: true,
        data: {
          user: data.user,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          }
        }
      })
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message
        }
      })
    }
  }

  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing authorization header'
          }
        })
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader

      const { error } = await supabase.auth.signOut(token)

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
          message: err.message
        }
      })
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body

      const validation = validateForgotPassword({ email })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
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
          message: err.message
        }
      })
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, token, password } = req.body

      const validation = validateResetPassword({ email, token, password })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const { data, error } = await supabase.auth.updateUser({
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
          message: err.message
        }
      })
    }
  }

  static async me(req, res) {
    try {
      const userId = req.user.id

      const { data: user, error } = await supabase
        .from('usuario')
        .select('id, email, nombre, apellido, createdat, urlfotoperfil, idestado, active')
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
          message: err.message
        }
      })
    }
  }
}
