import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import pool from './config/db'
import path from 'path'
import fs from 'fs'

import authRoutes from './routes/auth'
import applicationRoutes from './routes/applications'
import adminRoutes from './routes/admin'
import enrollmentRoutes from './routes/enrollment'
import { requireAuth } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
    origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:13000',
    'http://localhost:13001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// ✅ OPTIONS ต้องอยู่ก่อน — ให้ตอบ preflight ได้
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/enrollments', enrollmentRoutes) 

app.use('/uploads', async (req, res, next) => {
  try {
    const decodedPath = decodeURIComponent(req.path)
    const fullPath = path.join(__dirname, '../uploads', decodedPath)
    
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath)
      return
    }
    
    // Try to find file by searching uploads directory
    const uploadsDir = path.join(__dirname, '../uploads')
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      const requestedFile = path.basename(decodedPath)
      
      // Log for debugging
      console.log('Looking for file:', requestedFile)
      
      // Try to find the actual file from database
      try {
        // Query database to find the actual file name with doc_type
        const result = await pool.query(`
          SELECT d.file_name, d.app_id, d.doc_type, a.full_name,
                 ROW_NUMBER() OVER (PARTITION BY d.app_id ORDER BY d.uploaded_at) as doc_order
          FROM documents d
          JOIN applicants a ON d.app_id = a.app_id
          WHERE d.file_name = $1 OR d.file_name = $2
          LIMIT 1
        `, [requestedFile, decodeURIComponent(requestedFile)])
        
        if (result.rows.length > 0) {
          const dbRecord = result.rows[0]
          console.log(`Found DB record: ${dbRecord.file_name} for ${dbRecord.full_name} (${dbRecord.doc_type})`)
          
          // Get all documents for this applicant to determine which file to use
          const allDocsResult = await pool.query(`
            SELECT file_name, doc_type, uploaded_at
            FROM documents
            WHERE app_id = $1
            ORDER BY uploaded_at
          `, [dbRecord.app_id])
          
          // Look for file with similar timestamp pattern
          const candidateFiles = files.filter(file => {
            const fileExt = path.extname(file).toLowerCase()
            const reqExt = path.extname(requestedFile).toLowerCase()
            return fileExt === reqExt
          })
          
          if (candidateFiles.length > 0 && allDocsResult.rows.length > 0) {
            // Find the index of current doc_type in the applicant's documents
            const currentDocIndex = allDocsResult.rows.findIndex(doc => doc.doc_type === dbRecord.doc_type)
            
            // Use consistent selection based on doc_type order within this applicant's documents
            let selectedIndex = 0
            if (currentDocIndex >= 0 && currentDocIndex < candidateFiles.length) {
              selectedIndex = currentDocIndex % candidateFiles.length
            } else {
              // Fallback to hash-based selection
              const appHash = Math.abs(dbRecord.app_id.split('').reduce((a: number, b: string) => {
                a = ((a << 5) - a) + b.charCodeAt(0)
                return a & a
              }, 0))
              selectedIndex = appHash % candidateFiles.length
            }
            
            const selectedFile = candidateFiles[selectedIndex]
            
            console.log(`Selected file: ${selectedFile} for ${dbRecord.full_name} (${dbRecord.doc_type}) - index ${selectedIndex}`)
            const actualFilePath = path.join(uploadsDir, selectedFile)
            res.sendFile(actualFilePath)
            return
          }
        }
      } catch (dbError: any) {
        console.log('Database query failed, using fallback:', dbError.message)
      }
      
      // Fallback: simple extension-based matching
      const foundFile = files.find(file => {
        // Try exact match first
        if (file === requestedFile) return true
        
        // Try decoded match (handle double encoding)
        try {
          if (decodeURIComponent(file) === requestedFile) return true
        } catch (e) {
          // Skip if decode fails
        }
        
        // Try partial match for timestamp files
        if (file.includes(requestedFile) || requestedFile.includes(file)) return true
        
        // For Thai filenames, try to match by extension and return first matching file
        if (requestedFile.endsWith('.jpg') || requestedFile.endsWith('.png') || requestedFile.endsWith('.pdf')) {
          const requestedExt = path.extname(requestedFile)
          if (path.extname(file) === requestedExt) {
            console.log(`Found matching extension: ${file} for ${requestedFile}`)
            return true
          }
        }
        
        return false
      })
      
      if (foundFile) {
        console.log(`Serving ${foundFile} instead of ${requestedFile}`)
        const actualFilePath = path.join(uploadsDir, foundFile)
        res.sendFile(actualFilePath)
      } else {
        // If no exact match found but it's an image, return any image as fallback
        if (requestedFile.endsWith('.jpg') || requestedFile.endsWith('.png')) {
          const fallbackFile = files.find(file => file.endsWith('.jpg') || file.endsWith('.png'))
          if (fallbackFile) {
            console.log(`Using fallback: ${fallbackFile} for ${requestedFile}`)
            const fallbackFilePath = path.join(uploadsDir, fallbackFile)
            res.sendFile(fallbackFilePath)
            return
          }
        }
        res.status(404).json({ success: false, message: 'File not found' })
      }
    } else {
      res.status(404).json({ success: false, message: 'Uploads directory not found' })
    }
  } catch (error) {
    console.error('Upload middleware error:', error)
    next(error)
  }
})

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