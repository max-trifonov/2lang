export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

interface ErrorResponseBody {
  code?: unknown
  message?: unknown
  details?: unknown
}

function readErrorField(body: unknown, field: 'code' | 'message'): string | undefined {
  const value = (body as ErrorResponseBody | null | undefined)?.[field]
  return typeof value === 'string' ? value : undefined
}

export function parseErrorResponse(status: number, body: unknown): ApiError {
  const code = readErrorField(body, 'code') ?? 'unknown'
  const message = readErrorField(body, 'message') ?? 'Unexpected error'
  const details = (body as ErrorResponseBody | null | undefined)?.details
  return new ApiError(status, code, message, details)
}
