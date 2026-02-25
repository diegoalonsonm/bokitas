import { Router } from 'express'
import { UserController } from '../Controllers/userController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { uploadSingle } from '../Middleware/uploadMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const userRouter = Router()

userRouter.get('/:id', asyncHandler((req, res) => UserController.getProfile(req, res)))
userRouter.put('/:id', authMiddleware, asyncHandler((req, res) => UserController.updateProfile(req, res)))
userRouter.delete('/:id', authMiddleware, asyncHandler((req, res) => UserController.deleteAccount(req, res)))
userRouter.post('/:id/photo', authMiddleware, ...uploadSingle('photo'), asyncHandler((req, res) => UserController.uploadProfilePhoto(req, res)))
userRouter.get('/:id/reviews', asyncHandler((req, res) => UserController.getReviews(req, res)))
userRouter.get('/:id/eatlist', asyncHandler((req, res) => UserController.getEatlist(req, res)))
userRouter.get('/:id/top4', asyncHandler((req, res) => UserController.getTop4(req, res)))

export default userRouter
