import { Router } from 'express'
import type {
  GetReviewRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  DeleteReviewRequest,
  UploadReviewPhotoRequest,
  GetRecentReviewsRequest
} from '../types/api/review.api.types.js'
import { ReviewController } from '../Controllers/reviewController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { uploadSingle } from '../Middleware/uploadMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const reviewRouter = Router()

// Public routes
reviewRouter.get('/recent', asyncHandler((req, res) => ReviewController.getRecent(req as unknown as GetRecentReviewsRequest, res)))
reviewRouter.get('/:id', asyncHandler((req, res) => ReviewController.getById(req as unknown as GetReviewRequest, res)))

// Protected routes
reviewRouter.post('/', authMiddleware, asyncHandler((req, res) => ReviewController.create(req as unknown as CreateReviewRequest, res)))
reviewRouter.put('/:id', authMiddleware, asyncHandler((req, res) => ReviewController.update(req as unknown as UpdateReviewRequest, res)))
reviewRouter.delete('/:id', authMiddleware, asyncHandler((req, res) => ReviewController.delete(req as unknown as DeleteReviewRequest, res)))
reviewRouter.post('/:id/photo', authMiddleware, uploadSingle('photo'), asyncHandler((req, res) => ReviewController.uploadPhoto(req as unknown as UploadReviewPhotoRequest, res)))

export default reviewRouter
