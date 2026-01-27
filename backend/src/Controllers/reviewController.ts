import type { Response } from 'express'
import { ReviewModel } from '../Models/reviewModel.js'
import { UserModel } from '../Models/userModel.js'
import { validateCreateReview, validateUpdateReview, validateReviewId } from '../Models/validations/reviewValidation.js'
import { StorageService } from '../Services/storageService.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'
import type {
  CreateReviewRequest,
  GetReviewRequest,
  UpdateReviewRequest,
  DeleteReviewRequest,
  UploadReviewPhotoRequest
} from '../types/api/review.api.types.js'

export class ReviewController {
  /**
   * POST /reviews
   * Create a new review
   */
  static async create(req: CreateReviewRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required'
          }
        })
        return
      }

      const validation = validateCreateReview(req.body)

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: validation.error.errors[0].message
          }
        })
        return
      }

      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        })
        return
      }

      const review = await ReviewModel.create({
        ...validation.data,
        userId
      })

      res.status(201).json({
        success: true,
        data: review
      })
    } catch (err) {
      console.error('Create review error:', err)

      if ((err as Error).message === 'Restaurant not found') {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.RESTAURANTE_NOT_FOUND
          }
        })
        return
      }

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
   * GET /reviews/:id
   * Get review details
   */
  static async getById(req: GetReviewRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateReviewId({ id: req.params.id })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: validation.error.errors[0].message
          }
        })
        return
      }

      const review = await ReviewModel.getById({ id: validation.data.id })

      if (!review) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.REVIEW_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: review
      })
    } catch (err) {
      console.error('Get review by ID error:', err)
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
   * PUT /reviews/:id
   * Update review (owner only)
   */
  static async update(req: UpdateReviewRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required'
          }
        })
        return
      }

      const idValidation = validateReviewId({ id: req.params.id })

      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: idValidation.error.errors[0].message
          }
        })
        return
      }

      const bodyValidation = validateUpdateReview(req.body)

      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: bodyValidation.error.errors[0].message
          }
        })
        return
      }

      const updated = await ReviewModel.update({
        id: idValidation.data.id,
        userId,
        ...bodyValidation.data
      })

      if (!updated) {
        const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
        if (!ownerId) {
          res.status(404).json({
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: ERROR_MESSAGES.USER_NOT_FOUND
            }
          })
          return
        }

        const isOwner = await ReviewModel.isOwner(idValidation.data.id, userId)
        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: {
              code: ERROR_CODES.FORBIDDEN,
              message: ERROR_MESSAGES.NOT_OWNER
            }
          })
          return
        }

        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.REVIEW_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: updated
      })
    } catch (err) {
      console.error('Update review error:', err)
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
   * DELETE /reviews/:id
   * Soft delete review (owner only)
   */
  static async delete(req: DeleteReviewRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required'
          }
        })
        return
      }

      const validation = validateReviewId({ id: req.params.id })

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: validation.error.errors[0].message
          }
        })
        return
      }

      const result = await ReviewModel.softDelete({ id: validation.data.id, userId })

      if (!result.success) {
        const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
        if (!ownerId) {
          res.status(404).json({
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: ERROR_MESSAGES.USER_NOT_FOUND
            }
          })
          return
        }

        const isOwner = await ReviewModel.isOwner(validation.data.id, userId)
        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: {
              code: ERROR_CODES.FORBIDDEN,
              message: ERROR_MESSAGES.NOT_OWNER
            }
          })
          return
        }

        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.REVIEW_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (err) {
      console.error('Delete review error:', err)
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
   * POST /reviews/:id/photo
   * Upload review photo (owner only)
   */
  static async uploadPhoto(req: UploadReviewPhotoRequest & { file?: unknown }, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required'
          }
        })
        return
      }

      const idValidation = validateReviewId({ id: req.params.id })

      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: idValidation.error.errors[0].message
          }
        })
        return
      }

      const fileData = req.file as { buffer: Buffer; originalname?: string; mimetype?: string }

      if (!fileData || !fileData.buffer) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Review photo is required'
          }
        })
        return
      }

      const fileObj: any = new File([new Uint8Array(fileData.buffer)], fileData.originalname || 'photo.jpg', { type: fileData.mimetype || 'image/jpeg' })

      const uploadResult = await StorageService.uploadReviewPhoto(userId, fileObj)

      if (!uploadResult.success || !uploadResult.url) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: uploadResult.message
          }
        })
        return
      }

      const updateResult = await ReviewModel.updatePhoto({
        id: idValidation.data.id,
        userId,
        photoUrl: uploadResult.url
      })

      if (!updateResult.success) {
        const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
        if (!ownerId) {
          res.status(404).json({
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: ERROR_MESSAGES.USER_NOT_FOUND
            }
          })
          return
        }

        const isOwner = await ReviewModel.isOwner(idValidation.data.id, userId)
        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: {
              code: ERROR_CODES.FORBIDDEN,
              message: ERROR_MESSAGES.NOT_OWNER
            }
          })
          return
        }

        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.REVIEW_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: {
          photoUrl: uploadResult.url
        },
        message: updateResult.message
      })
    } catch (err) {
      console.error('Upload review photo error:', err)
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
