import { Router } from 'express'
import { UserController } from '../Controllers/userController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { uploadSingle } from '../Middleware/uploadMiddleware.js'

const userRouter = Router()

userRouter.get('/:id', (req, res, next) => UserController.getProfile(req, res, next))
userRouter.put('/:id', authMiddleware, (req, res, next) => UserController.updateProfile(req, res, next))
userRouter.delete('/:id', authMiddleware, (req, res, next) => UserController.deleteAccount(req, res, next))
userRouter.post('/:id/photo', authMiddleware, uploadSingle('photo'), (req, res, next) => UserController.uploadProfilePhoto(req, res, next))
userRouter.get('/:id/reviews', (req, res, next) => UserController.getReviews(req, res, next))
userRouter.get('/:id/eatlist', (req, res, next) => UserController.getEatlist(req, res, next))
userRouter.get('/:id/top4', (req, res, next) => UserController.getTop4(req, res, next))

export default userRouter
