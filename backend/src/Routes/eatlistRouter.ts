import { Router } from 'express'
import type {
  GetEatlistRequest,
  AddToEatlistRequest,
  UpdateEatlistRequest,
  RemoveFromEatlistRequest
} from '../types/api/eatlist.api.types.js'
import { EatlistController } from '../Controllers/eatlistController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const eatlistRouter = Router()

// All routes require authentication
eatlistRouter.get('/', authMiddleware, asyncHandler((req, res) => EatlistController.getAll(req as unknown as GetEatlistRequest, res)))
eatlistRouter.post('/', authMiddleware, asyncHandler((req, res) => EatlistController.add(req as unknown as AddToEatlistRequest, res)))
eatlistRouter.put('/:restaurantId', authMiddleware, asyncHandler((req, res) => EatlistController.update(req as unknown as UpdateEatlistRequest, res)))
eatlistRouter.delete('/:restaurantId', authMiddleware, asyncHandler((req, res) => EatlistController.remove(req as unknown as RemoveFromEatlistRequest, res)))

export default eatlistRouter
