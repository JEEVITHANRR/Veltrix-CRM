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

  return res.status(500).json({ success: false, error: 'Internal server error' })
}
