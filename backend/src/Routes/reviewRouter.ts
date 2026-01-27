import { Router } from 'express'
import type {
  GetReviewRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  DeleteReviewRequest,
  UploadReviewPhotoRequest
} from '../types/api/review.api.types.js'
import { ReviewController } from '../Controllers/reviewController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { uploadSingle } from '../Middleware/uploadMiddleware.js'

const reviewRouter = Router()

// Public routes
reviewRouter.get('/:id', (req, res, next) => ReviewController.getById(req as unknown as GetReviewRequest, res, next))

// Protected routes
reviewRouter.post('/', authMiddleware, (req, res, next) => ReviewController.create(req as unknown as CreateReviewRequest, res, next))
reviewRouter.put('/:id', authMiddleware, (req, res, next) => ReviewController.update(req as unknown as UpdateReviewRequest, res, next))
reviewRouter.delete('/:id', authMiddleware, (req, res, next) => ReviewController.delete(req as unknown as DeleteReviewRequest, res, next))
reviewRouter.post('/:id/photo', authMiddleware, uploadSingle('photo'), (req, res, next) => ReviewController.uploadPhoto(req as unknown as UploadReviewPhotoRequest, res, next))

export default reviewRouter
