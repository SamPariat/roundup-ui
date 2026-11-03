/**
 * An API call that did not succeed: the server answered with an error status, or the request
 * never got an answer (status 0).
 */
export class ApiError extends Error {
  /** The HTTP status, or 0 when there was no response (offline, DNS, CORS). */
  readonly status: number

  /** The gateway's X-Request-ID for the response, to quote when reporting a problem. */
  readonly requestId: string | undefined

  /**
   * Builds the error.
   * @param status - The HTTP status, or 0 when there was no response.
   * @param message - The server's error text, or a generic one.
   * @param requestId - The response's X-Request-ID, when it had one.
   */
  constructor(status: number, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
  }
}

/**
 * Narrows an unknown caught value to an ApiError.
 * @param value - Anything that was thrown.
 * @returns True when the value is an ApiError.
 */
export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError
