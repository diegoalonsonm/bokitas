import { Router } from 'express'
import type {
  GetEatlistRequest,
  AddToEatlistRequest,
  UpdateEatlistRequest,
  RemoveFromEatlistRequest
} from '../types/api/eatlist.api.types.js'
import { EatlistController } from '../Controllers/eatlistController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const eatlistRouter = Router()

// All routes require authentication
eatlistRouter.get('/', authMiddleware, (req, res, next) => EatlistController.getAll(req as unknown as GetEatlistRequest, res, next))
eatlistRouter.post('/', authMiddleware, (req, res, next) => EatlistController.add(req as unknown as AddToEatlistRequest, res, next))
eatlistRouter.put('/:restaurantId', authMiddleware, (req, res, next) => EatlistController.update(req as unknown as UpdateEatlistRequest, res, next))
eatlistRouter.delete('/:restaurantId', authMiddleware, (req, res, next) => EatlistController.remove(req as unknown as RemoveFromEatlistRequest, res, next))

export default eatlistRouter
