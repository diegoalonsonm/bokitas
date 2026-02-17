import express, { type Express, type Request, type Response } from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// Import routers
import authRouter from './Routes/authRouter.js'
import userRouter from './Routes/userRouter.js'
import restaurantRouter from './Routes/restaurantRouter.js'
import reviewRouter from './Routes/reviewRouter.js'
import eatlistRouter from './Routes/eatlistRouter.js'
import foodTypeRouter from './Routes/foodTypeRouter.js'

// Import error middleware
import { errorHandler, notFoundHandler } from './Middleware/errorMiddleware.js'

config()

const PORT: number = parseInt(process.env.PORT || '4000', 10)
const app: Express = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

// Health check (before routes so it's always accessible)
app.get('/', (_req: Request, res: Response) => {
  res.status(200).send('API is running')
})

// Routes
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/restaurants', restaurantRouter)
app.use('/reviews', reviewRouter)
app.use('/eatlist', eatlistRouter)
app.use('/food-types', foodTypeRouter)

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
