import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
    (req.query.token as string | undefined)

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret')
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
