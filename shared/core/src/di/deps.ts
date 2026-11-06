import { QueryClient } from '@tanstack/react-query'

import type { INetworkSource } from '../network/types'
import type { ISessionStore } from '../session/types'

import { ErrorKey } from '../helpers/error-key'
import { Notice } from '../helpers/notice'
import { OtpCode } from '../helpers/otp-code'
import { Phone } from '../helpers/phone'
import { Query } from '../helpers/query'
import { NetworkSource } from '../network/network-source'
import { SessionStore } from '../session/session-store'

/** Everything outside the app that core depends on. Tests pass fakes for any of it. */
export interface IDeps {
  /** Where the refresh token is kept between launches. */
  session: ISessionStore
  /** The helper classes, held here so a test can swap one. */
  helpers: {
    /** Sign-in code parsing. */
    code: typeof OtpCode
    /** Error to message mapping. */
    errors: typeof ErrorKey
    /** Connection notice phases. */
    notice: typeof Notice
    /** Phone number parsing and formatting. */
    phone: typeof Phone
  }
  /** Whether the device has internet, and when that changes. */
  network: INetworkSource
  /** The TanStack Query cache every request goes through. */
  queryClient: QueryClient
  /** The current time in milliseconds, so countdowns can be tested without real waiting. */
  now: () => number
}

/**
 * Builds the dependencies. Static members only.
 */
export class Deps {
  /**
   * The query client's retry policy, delegating to Query.shouldRetry. An arrow
   * function because the query client takes it as a bare callback.
   * @param failureCount - How many times the query has failed so far.
   * @param error - What it failed with.
   * @returns True to try again.
   */
  private static readonly shouldRetry = (failureCount: number, error: unknown): boolean =>
    Query.shouldRetry(failureCount, error)

  /**
   * Builds the real dependencies: the platform's session store, the network source, a query client and the clock.
   * @returns The dependencies.
   */
  static create(): IDeps {
    return {
      helpers: { code: OtpCode, errors: ErrorKey, notice: Notice, phone: Phone },
      /**
       * Reads the system clock.
       * @returns Milliseconds since the epoch.
       */
      now: () => Date.now(),
      network: NetworkSource.create(),
      queryClient: new QueryClient({ defaultOptions: { queries: { retry: Deps.shouldRetry } } }),
      session: SessionStore.create(),
    }
  }
}
