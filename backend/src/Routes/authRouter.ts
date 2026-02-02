import { Router } from 'express'
import { AuthController } from '../Controllers/authController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const authRouter = Router()

authRouter.post('/register', asyncHandler(AuthController.register))
authRouter.post('/login', asyncHandler(AuthController.login))
authRouter.post('/logout', asyncHandler(AuthController.logout))
authRouter.post('/forgot-password', asyncHandler(AuthController.forgotPassword))
authRouter.post('/reset-password', asyncHandler(AuthController.resetPassword))
authRouter.get('/me', authMiddleware, asyncHandler(AuthController.me))

export default authRouter
