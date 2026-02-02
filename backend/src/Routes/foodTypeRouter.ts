import { Router } from 'express'
import type {
  GetAllFoodTypesRequest,
  CreateFoodTypeRequest
} from '../types/api/foodType.api.types.js'
import { FoodTypeController } from '../Controllers/foodTypeController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const foodTypeRouter = Router()

// Public routes
foodTypeRouter.get('/', asyncHandler((req, res) => FoodTypeController.getAll(req as unknown as GetAllFoodTypesRequest, res)))

// Protected routes (requires authentication, admin check deferred to Phase 2)
foodTypeRouter.post('/', authMiddleware, asyncHandler((req, res) => FoodTypeController.create(req as unknown as CreateFoodTypeRequest, res)))

export default foodTypeRouter
