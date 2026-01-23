import express, { type Express, type Request, type Response } from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// Import routers
import authRouter from './Routes/authRouter.js'
import userRouter from './Routes/userRouter.js'

config()

const PORT: number = parseInt(process.env.PORT || '3000', 10)
const app: Express = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

// Routes
app.use('/auth', authRouter)
app.use('/users', userRouter)

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.status(200).send('API is running')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
