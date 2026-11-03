import { Platform } from 'react-native'

import { ApiError } from './api-error'
import { getAuthBridge } from './auth-bridge'

/** The paths that sign in, refresh and sign out: a 401 from these is an answer, not an expired token. */
const AUTH_PATH = '/api/v1/auth/'

/** The statuses that carry no body. */
const NO_CONTENT = new Set([202, 204])

/** The response header the gateway puts a request ID in. */
const REQUEST_ID_HEADER = 'X-Request-ID'

/** The refresh already running, so concurrent 401s share one. */
let refreshing: Promise<boolean> | undefined

/**
 * The client kind the backend sees in X-Client. Web gets its refresh token as a cookie.
 * @returns web, ios or android.
 */
const clientKind = (): 'android' | 'ios' | 'web' =>
  Platform.select({ android: 'android', default: 'web', ios: 'ios' })

/**
 * Whether a url is one of the auth routes.
 * @param url - The request path.
 * @returns True for /api/v1/auth/*.
 */
const isAuthRoute = (url: string): boolean => url.startsWith(AUTH_PATH)

/**
 * Sends one request with the JSON, client and bearer headers. A network failure becomes an
 * ApiError with status 0.
 * @param url - The request path, joined to the API base URL.
 * @param init - The method, body and headers the generated client chose.
 * @returns The response.
 */
const send = async (url: string, init: RequestInit | undefined): Promise<Response> => {
  const headers = new Headers(init?.headers)
  const token = getAuthBridge()?.getAccessToken()

  headers.set('Accept', 'application/json')
  headers.set('X-Client', clientKind())

  if (token !== undefined && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    return await fetch(`${process.env.EXPO_PUBLIC_API_URL}${url}`, {
      ...init,
      headers,
      ...Platform.select({ default: {}, web: { credentials: 'include' as const } }),
    })
  } catch {
    throw new ApiError(0, 'Network request failed')
  }
}

/**
 * Runs the bridge's refresh once, however many callers ask while it is running.
 * @returns True when a fresh access token is available.
 */
const refreshOnce = (): Promise<boolean> => {
  const bridge = getAuthBridge()

  if (bridge === undefined) return Promise.resolve(false)

  refreshing ??= bridge.refresh().finally(() => {
    refreshing = undefined
  })

  return refreshing
}

/**
 * Reads a response body as JSON, or undefined when it is empty or not JSON.
 * @param response - The response to read.
 * @returns The parsed body.
 */
const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text()

  if (text === '') return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

/**
 * Picks the error text out of a `{success:false, error}` body.
 * @param body - The parsed error body.
 * @param fallback - The text to use when the body has none.
 * @returns The server's message, or the fallback.
 */
const errorMessage = (body: unknown, fallback: string): string => {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const { error } = body

    if (typeof error === 'string' && error !== '') return error
  }

  return fallback
}

/**
 * The orval mutator: every generated call goes through here. It talks to EXPO_PUBLIC_API_URL,
 * sends JSON, X-Client and the bearer token, and on a 401 from a non-auth route refreshes once
 * (shared by concurrent calls) and retries once. A 202 or 204 resolves undefined; any other
 * success resolves the parsed body, the `{success, data}` envelope; any failure throws an ApiError.
 * @param url - The request path from the generated client.
 * @param init - The request options from the generated client.
 * @returns The parsed response body, typed by the generated client.
 */
export const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response = await send(url, init)

  if (response.status === 401 && !isAuthRoute(url) && (await refreshOnce())) {
    response = await send(url, init)
  }

  const requestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined

  if (NO_CONTENT.has(response.status) && response.ok) return undefined as T

  const body = await readBody(response)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(body, response.statusText === '' ? 'Request failed' : response.statusText),
      requestId,
    )
  }

  return body as T
}
