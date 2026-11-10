import { ApiError, HttpStatus } from '@roundup/api'

/** How many times a failed query is tried again. */
const MAX_RETRIES = 2

/**
 * Query client policy helpers. Deps creates one and builds the query client's retry on it.
 */
export class Query {
  /**
   * Whether a failed query is worth trying again: only a lost connection or a server fault, never
   * an answer such as 401 or 404 that a retry cannot change.
   * @param failureCount - How many times it has failed so far.
   * @param error - What it failed with.
   * @returns True to try again.
   */
  shouldRetry(failureCount: number, error: unknown): boolean {
    if (failureCount >= MAX_RETRIES) return false

    return (
      !ApiError.is(error) ||
      error.status === HttpStatus.noResponse ||
      error.status >= HttpStatus.internalServerError
    )
  }
}
