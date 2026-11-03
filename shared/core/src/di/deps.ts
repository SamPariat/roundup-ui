import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@roundup/api'

import type { SessionStore } from '../session/types.ts'

import { createSessionStore } from '../session/session-store'

/** Everything outside the app that core depends on. Tests pass fakes for any of it. */
export interface Deps {
  /** Where the refresh token is kept between launches. */
  session: SessionStore
  /** The TanStack Query cache every request goes through. */
  queryClient: QueryClient
  /** The current time in milliseconds, so countdowns can be tested without real waiting. */
  now: () => number
}

/** How many times a failed query is tried again. */
const MAX_RETRIES = 2

/**
 * Whether a failed query is worth trying again: only a lost connection or a server fault, never
 * an answer such as 401 or 404 that a retry cannot change.
 * @param failureCount - How many times it has failed so far.
 * @param error - What it failed with.
 * @returns True to try again.
 */
export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= MAX_RETRIES) return false

  return !isApiError(error) || error.status === 0 || error.status >= 500
}

/**
 * Builds the real dependencies: the platform's session store, a query client and the clock.
 * @returns The dependencies.
 */
export const createDeps = (): Deps => ({
  /**
   * Reads the system clock.
   * @returns Milliseconds since the epoch.
   */
  now: () => Date.now(),
  queryClient: new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }),
  session: createSessionStore(),
})
