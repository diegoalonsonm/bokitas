import { Router } from 'express'
import type {
  GetAllFoodTypesRequest,
  CreateFoodTypeRequest
} from '../types/api/foodType.api.types.js'
import { FoodTypeController } from '../Controllers/foodTypeController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const foodTypeRouter = Router()

// Public routes
foodTypeRouter.get('/', (req, res, next) => FoodTypeController.getAll(req as unknown as GetAllFoodTypesRequest, res, next))

// Protected routes (requires authentication, admin check deferred to Phase 2)
foodTypeRouter.post('/', authMiddleware, (req, res, next) => FoodTypeController.create(req as unknown as CreateFoodTypeRequest, res, next))

export default foodTypeRouter
