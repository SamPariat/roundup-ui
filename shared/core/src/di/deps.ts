import { QueryClient } from '@tanstack/react-query'

import type { INetworkSource } from '../network/types'
import type { ISessionStore } from '../session/types'

import { CodeHelper } from '../helpers/code-helper'
import { ErrorHelper } from '../helpers/error-helper'
import { NoticeHelper } from '../helpers/notice-helper'
import { PhoneHelper } from '../helpers/phone-helper'
import { QueryHelper } from '../helpers/query-helper'
import { NetworkSource } from '../network/network-source'
import { SessionStore } from '../session/session-store'

/** Everything outside the app that core depends on. Tests pass fakes for any of it. */
export interface IDeps {
  /** Where the refresh token is kept between launches. */
  session: ISessionStore
  /** The helper classes, held here so a test can swap one. */
  helpers: {
    /** Sign-in code parsing. */
    code: typeof CodeHelper
    /** Error to message mapping. */
    errors: typeof ErrorHelper
    /** Connection notice phases. */
    notice: typeof NoticeHelper
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
 * Builds the dependencies. Static members only.
 */
export class Deps {
  /**
   * The query client's retry policy, delegating to the helper held in the container. An arrow
   * function because the query client takes it as a bare callback.
   * @param failureCount - How many times the query has failed so far.
   * @param error - What it failed with.
   * @returns True to try again.
   */
  private static readonly shouldRetry = (failureCount: number, error: unknown): boolean =>
    QueryHelper.shouldRetry(failureCount, error)

  /**
   * Builds the real dependencies: the platform's session store, the network source, a query client and the clock.
   * @returns The dependencies.
   */
  static create(): IDeps {
    return {
      helpers: { code: CodeHelper, errors: ErrorHelper, notice: NoticeHelper, phone: PhoneHelper },
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
