import { QueryClient } from '@tanstack/react-query'

import type { INetworkSource } from '../network/types'
import type { ISessionStore } from '../session/types'

import { ErrorHelper } from '../helpers/error-helper'
import { PhoneHelper } from '../helpers/phone-helper'
import { QueryHelper } from '../helpers/query-helper'
import { createNetworkSource } from '../network/network-source'
import { createSessionStore } from '../session/session-store'

/** Everything outside the app that core depends on. Tests pass fakes for any of it. */
export interface IDeps {
  /** Where the refresh token is kept between launches. */
  session: ISessionStore
  /** The helper classes, held here so a test can swap one. */
  helpers: {
    /** Error to message mapping. */
    errors: typeof ErrorHelper
    /** Phone number parsing and formatting. */
    phone: typeof PhoneHelper
  }
  /** Whether the device has internet, and when that changes. */
  network: INetworkSource
  /** The TanStack Query cache every request goes through. */
  queryClient: QueryClient
  /** The current time in milliseconds, so countdowns can be tested without real waiting. */
  now: () => number
}

/**
 * The query client's retry policy, delegating to the helper held in the container.
 * @param failureCount - How many times the query has failed so far.
 * @param error - What it failed with.
 * @returns True to try again.
 */
const shouldRetry = (failureCount: number, error: unknown): boolean =>
  QueryHelper.shouldRetry(failureCount, error)

/**
 * Builds the real dependencies: the platform's session store, the network source, a query client and the clock.
 * @returns The dependencies.
 */
export const createDeps = (): IDeps => ({
  helpers: { errors: ErrorHelper, phone: PhoneHelper },
  /**
   * Reads the system clock.
   * @returns Milliseconds since the epoch.
   */
  now: () => Date.now(),
  network: createNetworkSource(),
  queryClient: new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }),
  session: createSessionStore(),
})
