import { NetworkError, parseErrorResponse } from './errors'
import { withRetry } from './retry'

export interface ApiClientOptions {
  baseUrl?: string
  getAccessToken?: () => string | null | undefined
  getLocale?: () => string
}

let accessTokenProvider: (() => string | null | undefined) | null = null

export function setAccessTokenProvider(provider: () => string | null | undefined): void {
  accessTokenProvider = provider
}

async function performAttempt(baseRequest: Request, signal: AbortSignal): Promise<Response> {
  const attemptRequest = new Request(baseRequest.clone(), { signal })
  let response: Response
  try {
    response = await fetch(attemptRequest)
  } catch {
    throw new NetworkError('Сеть недоступна')
  }
  if (response.ok) return response
  const body: unknown = await response
    .clone()
    .json()
    .catch(() => undefined)
  throw parseErrorResponse(response.status, body)
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? __API_BASE_URL__).replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    if (!headers.has('Accept')) headers.set('Accept', 'application/json')
    const locale = options.getLocale?.()
    if (locale) headers.set('Accept-Language', locale)
    const token = options.getAccessToken?.() ?? accessTokenProvider?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const url = path.startsWith('http') ? path : `${baseUrl}${path}`
    const response = await withRetry((signal) =>
      performAttempt(new Request(url, { ...init, headers }), signal),
    )
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
