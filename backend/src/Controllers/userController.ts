import type { Response } from 'express'
import { type Request } from 'express'
import { UserModel } from '../Models/userModel.js'
import { validateProfileUpdate, validateId } from '../Models/validations/userValidation.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'
import type { UpdateProfileBody, UserQuery } from '../types/api/user.api.types.js'

export class UserController {
  /**
   * GET /users/:id
   * Get user profile (public info)
   */
  static async getProfile(req: Request<Record<string, string>>, res: Response, _next: unknown): Promise<void> {
    try {
      const { id } = req.params

      const validation = validateId({ id })

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

      const user = await UserModel.getById({ id })

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          urlfotoperfil: user.urlfotoperfil,
          createdat: user.createdat,
          idestado: user.idestado
        }
      })
    } catch (err) {
      console.error('Get profile error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * PUT /users/:id
   * Update own profile
   */
  static async updateProfile(req: Request<Record<string, string>, unknown, UpdateProfileBody>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id
      const updates = req.body

      const validation = validateProfileUpdate(updates)

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

      if (req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
        return
      }

      const result = await UserModel.updateProfile({ id, ...updates })

      res.status(200).json(result)
    } catch (err) {
      console.error('Update profile error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * DELETE /users/:id
   * Deactivate account (soft delete)
   */
  static async deleteAccount(req: Request<Record<string, string>>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id

      const validation = validateId({ id })

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

      if (req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
        return
      }

      const result = await UserModel.softDelete({ id })

      res.status(200).json(result)
    } catch (err) {
      console.error('Delete account error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * GET /users/:id/reviews
   * Get user's reviews
   */
  static async getReviews(req: Request<Record<string, string>, unknown, unknown, UserQuery>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id
      const page = parseInt(req.query.page || '1')
      const limit = parseInt(req.query.limit || '20')

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
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * GET /users/:id/eatlist
   * Get user's eatlist
   */
  static async getEatlist(req: Request<Record<string, string>>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id

      const validation = validateId({ id })

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
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * GET /users/:id/top4
   * Get user's top 4 rated restaurants
   */
  static async getTop4(req: Request<Record<string, string>>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id

      const validation = validateId({ id })

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
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /users/:id/photo
   * Upload profile photo
   */
  static async uploadProfilePhoto(req: Request<Record<string, string>>, res: Response, _next: unknown): Promise<void> {
    try {
      const id = req.params.id

      const validation = validateId({ id })

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

      if (req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: ERROR_MESSAGES.NOT_OWNER
          }
        })
        return
      }

      if (!(req as any).file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Profile photo is required'
          }
        })
        return
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
          message: (err as Error).message
        }
      })
    }
  }
}
