import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import pool from './config/db'

import authRoutes from './routes/auth'
import applicationRoutes from './routes/applications'
import adminRoutes from './routes/admin'
import enrollmentRoutes from './routes/enrollment'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
    origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:13000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// ✅ OPTIONS ต้องอยู่ก่อน — ให้ตอบ preflight ได้
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

app.use(helmet())

app.use(cors({ origin: ['http://localhost:13000', 'http://localhost:5173'], credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/enrollments', enrollmentRoutes) 

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ success: true, message: 'Server running', db: 'connected' })
  } catch {
    res.status(500).json({ success: false, message: 'DB connection failed' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})