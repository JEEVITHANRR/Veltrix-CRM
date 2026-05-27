// apps/api/src/middleware/error.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ message: err.message, stack: err.stack, path: req.path })

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }

  // In production, show the error TYPE (Prisma, Redis, etc.) to help debug
  // but never expose stack traces
  const errorType = err.constructor?.name || 'UnknownError'
  const safeMessage = getSafeErrorMessage(err)
  
  return res.status(500).json({ 
    success: false, 
    error: safeMessage,
    type: errorType,
  })
}

function getSafeErrorMessage(err: Error): string {
  const msg = err.message || ''
  
  // Prisma connection errors
  if (msg.includes('Can\'t reach database') || msg.includes('connect ECONNREFUSED')) {
    return 'Database connection failed. Please try again in a moment.'
  }
  
  // Prisma table not found
  if (msg.includes('does not exist in the current database') || msg.includes('relation') && msg.includes('does not exist')) {
    return 'Database schema not initialized. Contact support.'
  }

  // Redis errors
  if (msg.includes('ECONNREFUSED') && msg.includes('6379')) {
    return 'Background job service unavailable. Core features still work.'
  }

  // Generic
  return 'Internal server error'
}
