import { Router } from 'express'
import { UserController } from '../Controllers/userController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const userRouter = Router()

userRouter.get('/:id', UserController.getProfile)
userRouter.put('/:id', authMiddleware, UserController.updateProfile)
userRouter.delete('/:id', authMiddleware, UserController.deleteAccount)
userRouter.post('/:id/photo', authMiddleware, UserController.uploadProfilePhoto)
userRouter.get('/:id/reviews', UserController.getReviews)
userRouter.get('/:id/eatlist', UserController.getEatlist)
userRouter.get('/:id/top4', UserController.getTop4)

export default userRouter
