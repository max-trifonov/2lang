export interface RetryOptions {
  timeoutMs?: number
  maxAttempts?: number
}

interface RetryableError {
  status?: number
  retryAfterMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_MAX_ATTEMPTS = 3
const BASE_BACKOFF_MS = 300

function retryableStatus(status: number | undefined): boolean {
  if (status === undefined) return true
  return status === 429 || status >= 500
}

function backoffDelayMs(error: unknown, attemptNumber: number): number {
  const retryAfterMs = (error as RetryableError)?.retryAfterMs
  if (retryAfterMs !== undefined) return retryAfterMs
  return BASE_BACKOFF_MS * 2 ** (attemptNumber - 1)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  attempt: (signal: AbortSignal) => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxAttempts = opts.maxAttempts ?? DEFAULT_MAX_ATTEMPTS

  for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const result = await attempt(controller.signal)
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      const status = (error as RetryableError)?.status
      if (!retryableStatus(status) || attemptNumber === maxAttempts) throw error
      await sleep(backoffDelayMs(error, attemptNumber))
    }
  }
  throw new Error('withRetry: unreachable')
}
