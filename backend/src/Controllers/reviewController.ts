import type { Response } from 'express'
import { ReviewModel } from '../Models/reviewModel.js'
import { UserModel } from '../Models/userModel.js'
import { validateCreateReview, validateUpdateReview, validateReviewId } from '../Models/validations/reviewValidation.js'
import { StorageService } from '../Services/storageService.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError
} from '../Middleware/errorMiddleware.js'
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
  static async create(req: CreateReviewRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const validation = validateCreateReview(req.body)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
    if (!ownerId) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }

    const review = await ReviewModel.create({
      ...validation.data,
      userId
    })

    res.status(201).json({
      success: true,
      data: review
    })
  }

  /**
   * GET /reviews/:id
   * Get review details
   */
  static async getById(req: GetReviewRequest, res: Response): Promise<void> {
    const validation = validateReviewId({ id: req.params.id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const review = await ReviewModel.getById({ id: validation.data.id })

    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      data: review
    })
  }

  /**
   * PUT /reviews/:id
   * Update review (owner only)
   */
  static async update(req: UpdateReviewRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const idValidation = validateReviewId({ id: req.params.id })

    if (!idValidation.success) {
      throw new ValidationError(idValidation.error.errors[0].message)
    }

    const bodyValidation = validateUpdateReview(req.body)

    if (!bodyValidation.success) {
      throw new ValidationError(bodyValidation.error.errors[0].message)
    }

    // Check ownership first
    const isOwner = await ReviewModel.isOwner(idValidation.data.id, userId)
    if (!isOwner) {
      // Check if user exists
      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
      }
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const updated = await ReviewModel.update({
      id: idValidation.data.id,
      userId,
      ...bodyValidation.data
    })

    if (!updated) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      data: updated
    })
  }

  /**
   * DELETE /reviews/:id
   * Soft delete review (owner only)
   */
  static async delete(req: DeleteReviewRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const validation = validateReviewId({ id: req.params.id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    // Check ownership first
    const isOwner = await ReviewModel.isOwner(validation.data.id, userId)
    if (!isOwner) {
      // Check if user exists
      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
      }
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const result = await ReviewModel.softDelete({ id: validation.data.id, userId })

    if (!result.success) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      message: result.message
    })
  }

  /**
   * POST /reviews/:id/photo
   * Upload review photo (owner only)
   */
  static async uploadPhoto(req: UploadReviewPhotoRequest & { file?: unknown }, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const idValidation = validateReviewId({ id: req.params.id })

    if (!idValidation.success) {
      throw new ValidationError(idValidation.error.errors[0].message)
    }

    const fileData = req.file as { buffer: Buffer; originalname?: string; mimetype?: string }

    if (!fileData || !fileData.buffer) {
      throw new ValidationError('Review photo is required')
    }

    // Check ownership first
    const isOwner = await ReviewModel.isOwner(idValidation.data.id, userId)
    if (!isOwner) {
      // Check if user exists
      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
      }
      throw new ForbiddenError(ERROR_MESSAGES.NOT_OWNER)
    }

    const fileObj: File = new File(
      [new Uint8Array(fileData.buffer)],
      fileData.originalname || 'photo.jpg',
      { type: fileData.mimetype || 'image/jpeg' }
    )

    const uploadResult = await StorageService.uploadReviewPhoto(userId, fileObj)

    if (!uploadResult.success || !uploadResult.url) {
      throw new ValidationError(uploadResult.message)
    }

    const updateResult = await ReviewModel.updatePhoto({
      id: idValidation.data.id,
      userId,
      photoUrl: uploadResult.url
    })

    if (!updateResult.success) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      data: {
        photoUrl: uploadResult.url
      },
      message: updateResult.message
    })
  }
}
