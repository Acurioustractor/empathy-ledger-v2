import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  code?: string
  details?: any
  timestamp?: string
}

export interface ApiSuccess<T = any> {
  success: true
  data?: T
  message?: string
  timestamp?: string
}

export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any
): NextResponse {
  const errorResponse: ApiError = {
    error: message,
    timestamp: new Date().toISOString()
  }

  if (code) {
    errorResponse.code = code
  }

  if (details) {
    errorResponse.details = details
  }

  return NextResponse.json(errorResponse, { status })
}

export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  const successResponse: ApiSuccess<T> = {
    success: true,
    timestamp: new Date().toISOString()
  }

  if (data !== undefined) {
    successResponse.data = data
  }

  if (message) {
    successResponse.message = message
  }

  return NextResponse.json(successResponse, { status })
}

// Common error responses
export const ApiErrors = {
  Unauthorized: (message = 'Unauthorized') =>
    createErrorResponse(message, 401, 'UNAUTHORIZED'),

  Forbidden: (message = 'Forbidden') =>
    createErrorResponse(message, 403, 'FORBIDDEN'),

  NotFound: (message = 'Resource not found') =>
    createErrorResponse(message, 404, 'NOT_FOUND'),

  BadRequest: (message = 'Bad request', details?: any) =>
    createErrorResponse(message, 400, 'BAD_REQUEST', details),

  InternalError: (message = 'Internal server error', details?: any) =>
    createErrorResponse(message, 500, 'INTERNAL_ERROR', details),

  ValidationError: (message = 'Validation failed', details?: any) =>
    createErrorResponse(message, 422, 'VALIDATION_ERROR', details),

  AdminRequired: (message = 'Admin privileges required') =>
    createErrorResponse(message, 403, 'ADMIN_REQUIRED'),

  InvalidInput: (message = 'Invalid input provided', details?: any) =>
    createErrorResponse(message, 400, 'INVALID_INPUT', details)
}
