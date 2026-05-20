// apps/api/src/__tests__/middleware.test.ts
import { AppError } from '../middleware/error'
import { Request, Response, NextFunction } from 'express'
import { errorMiddleware } from '../middleware/error'
import { ZodError, ZodIssueCode } from 'zod'

// ─── AppError ────────────────────────────────────────────
describe('AppError', () => {
  it('creates error with statusCode and message', () => {
    const err = new AppError(404, 'Not found')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.isOperational).toBe(true)
  })

  it('is an instance of Error', () => {
    const err = new AppError(500, 'Server error')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it('accepts custom isOperational flag', () => {
    const err = new AppError(500, 'Fatal', false)
    expect(err.isOperational).toBe(false)
  })
})

// ─── errorMiddleware ─────────────────────────────────────
describe('errorMiddleware', () => {
  const mockReq = { path: '/test' } as Request
  const mockNext = jest.fn() as unknown as NextFunction
  let mockRes: Partial<Response>

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('handles AppError with correct status code', () => {
    const err = new AppError(403, 'Forbidden')
    errorMiddleware(err, mockReq, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Forbidden' })
  })

  it('returns 500 for unknown errors', () => {
    const err = new Error('Something exploded')
    errorMiddleware(err, mockReq, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' })
  })

  it('handles ZodError with 400 and field details', () => {
    const zodErr = new ZodError([{
      code: ZodIssueCode.invalid_type,
      expected: 'string',
      received: 'undefined',
      path: ['email'],
      message: 'Required',
    }])
    errorMiddleware(zodErr, mockReq, mockRes as Response, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(400)
    const call = (mockRes.json as jest.Mock).mock.calls[0][0]
    expect(call.success).toBe(false)
    expect(call.error).toBe('Validation error')
    expect(call.details[0].field).toBe('email')
  })
})
