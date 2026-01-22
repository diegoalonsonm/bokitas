import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'

config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

import authRouter from './Routes/authRouter.js'
import userRouter from './Routes/userRouter.js'

app.use('/auth', authRouter)
app.use('/users', userRouter)

app.get('/', (req, res) => {
  res.status(200).send('API is running')
})

export default app
