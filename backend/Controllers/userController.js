import { UserModel } from '../Models/userModel.js'
import { supabase } from '../Models/supabase/client.js'
import { validateProfileUpdate, validateId } from '../Models/validations/userValidation.js'
import { ESTADO, ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'

export class UserController {
  static async getProfile(req, res) {
    try {
      const { id } = req.params

      const validation = validateId({ id })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const user = await UserModel.getById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        })
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          urlfotoperfil: user.urlfotoperfil
          createdat: user.createdat
          idestado: user.idestado
        }
      })
    } catch (err) {
      console.error('Get profile error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async updateProfile(req, res) {
    try {
      const { id } = req.params
      const updates = req.body

      const validation = validateProfileUpdate(updates)

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      if (req.user.id !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
      }

      const result = await UserModel.updateProfile(id, updates)

      res.status(200).json(result)
    } catch (err) {
      console.error('Update profile error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async deleteAccount(req, res) {
    try {
      const { id } = req.params

      const validation = validateId({ id })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      if (req.user.id !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
      }

      const result = await UserModel.softDelete(id)

      res.status(200).json(result)
    } catch (err) {
      console.error('Delete account error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async getReviews(req, res) {
    try {
      const { id } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20

      const reviews = await UserModel.getReviews(id, page, limit)

      res.status(200).json({
        success: true,
        data: reviews,
        meta: {
          page,
          limit
        }
      })
    } catch (err) {
      console.error('Get user reviews error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async getEatlist(req, res) {
    try {
      const { id } = req.params

      const validation = validateId({ id })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const eatlist = await UserModel.getEatlist(id)

      res.status(200).json({
        success: true,
        data: eatlist
      })
    } catch (err) {
      console.error('Get user eatlist error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async getTop4(req, res) {
    try {
      const { id } = req.params

      const validation = validateId({ id })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      const restaurants = await UserModel.getTop4(id)

      res.status(200).json({
        success: true,
        data: restaurants
      })
    } catch (err) {
      console.error('Get top 4 error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }

  static async uploadProfilePhoto(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const validation = validateId({ id })

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message
          }
        })
      }

      if (req.user.id !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Profile photo is required'
          }
        })
      }

      res.status(200).json({
        success: true,
        message: 'Photo upload endpoint ready - storage integration coming in Sprint 2'
      })
    } catch (err) {
      console.error('Upload profile photo error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: err.message
        }
      })
    }
  }
}
