// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './error'

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface AuthTokenPayload {
  userId: string
  workspaceId: string
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) throw new AppError(401, 'Authentication required')

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload
    req.user = payload
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'Authentication required')
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions')
    }
    next()
  }
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
