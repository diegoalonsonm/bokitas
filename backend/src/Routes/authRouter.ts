import { Router } from 'express'
import { AuthController } from '../Controllers/authController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const authRouter = Router()

authRouter.post('/register', AuthController.register)
authRouter.post('/login', AuthController.login)
authRouter.post('/logout', AuthController.logout)
authRouter.post('/forgot-password', AuthController.forgotPassword)
authRouter.post('/reset-password', AuthController.resetPassword)
authRouter.get('/me', authMiddleware, AuthController.me)

export default authRouter
