import type { Response } from 'express'
import { type Request } from 'express'
import { UserModel } from '../Models/userModel.js'
import { validateProfileUpdate, validateId } from '../Models/validations/userValidation.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import { StorageService } from '../Services/storageService.js'
import {
  ValidationError,
  NotFoundError,
  ForbiddenError
} from '../Middleware/errorMiddleware.js'
import type { UpdateProfileBody, UserQuery } from '../types/api/user.api.types.js'

export class UserController {
  /**
   * GET /users/:id
   * Get user profile (public info)
   */
  static async getProfile(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const id = req.params.id

    const validation = validateId({ id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const user = await UserModel.getById({ id })

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        primerapellido: user.primerapellido,
        segundoapellido: user.segundoapellido,
        urlFotoPerfil: user.urlFotoPerfil,
        createdat: user.createdat,
        idestado: user.idestado
      }
    })
  }

  /**
   * PUT /users/:id
   * Update own profile
   */
  static async updateProfile(req: Request<Record<string, string>, unknown, UpdateProfileBody>, res: Response): Promise<void> {
    const id = req.params.id
    const updates = req.body

    const validation = validateProfileUpdate(updates)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    if (req.user?.id !== id) {
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const result = await UserModel.updateProfile({ id, ...updates })

    if (!result.success) {
      throw new NotFoundError(result.message)
    }

    res.status(200).json(result)
  }

  /**
   * DELETE /users/:id
   * Deactivate account (soft delete)
   */
  static async deleteAccount(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const id = req.params.id

    const validation = validateId({ id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    if (req.user?.id !== id) {
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const result = await UserModel.softDelete({ id })

    res.status(200).json(result)
  }

  /**
   * GET /users/:id/reviews
   * Get user's reviews
   */
  static async getReviews(req: Request<Record<string, string>, unknown, unknown, UserQuery>, res: Response): Promise<void> {
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
  }

  /**
   * GET /users/:id/eatlist
   * Get user's eatlist
   */
  static async getEatlist(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const id = req.params.id

    const validation = validateId({ id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const eatlist = await UserModel.getEatlist(id)

    res.status(200).json({
      success: true,
      data: eatlist
    })
  }

  /**
   * GET /users/:id/top4
   * Get user's top 4 rated restaurants
   */
  static async getTop4(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const id = req.params.id

    const validation = validateId({ id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const restaurants = await UserModel.getTop4(id)

    res.status(200).json({
      success: true,
      data: restaurants
    })
  }

  /**
   * POST /users/:id/photo
   * Upload profile photo
   */
  static async uploadProfilePhoto(req: Request<Record<string, string>> & { file?: unknown }, res: Response): Promise<void> {
    const id = req.params.id

    const validation = validateId({ id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    if (req.user?.id !== id) {
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const fileData = req.file as { buffer: Buffer; originalname?: string; mimetype?: string }

    if (!fileData || !fileData.buffer) {
      throw new ValidationError('Profile photo is required')
    }

    const fileObj: File = new File(
      [new Uint8Array(fileData.buffer)],
      fileData.originalname || 'photo.jpg',
      { type: fileData.mimetype || 'image/jpeg' }
    )

    const result = await StorageService.uploadProfilePhoto(id, fileObj)

    if (!result.success) {
      throw new ValidationError(result.message)
    }

    await UserModel.updateProfile({ id, urlFotoPerfil: result.url })

    res.status(200).json({
      success: true,
      data: {
        urlFotoPerfil: result.url
      },
      message: 'Profile photo uploaded successfully'
    })
  }
}
