import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization']
  return (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
    (req.query.token as string | undefined) || null
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret')
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    if (payload.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' })
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
