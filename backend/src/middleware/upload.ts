import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request, Response, NextFunction } from 'express'

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('ไฟล์ต้องเป็น JPG, PNG หรือ PDF เท่านั้น'))
}


const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export const upload = {
  single: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message })
      next()
    })
  },
  fields: (fields: multer.Field[]) => (req: Request, res: Response, next: NextFunction) => {
    multerUpload.fields(fields)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message })
      next()
    })
  }
}