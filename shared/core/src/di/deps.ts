import { QueryClient } from '@tanstack/react-query'

import type { IContactsSource } from '../contacts/types'
import type { INetworkSource } from '../network/types'
import type { ISessionStore } from '../session/types'

import { ContactsSource } from '../contacts/contacts-source'
import { ErrorKey } from '../helpers/error-key'
import { Notice } from '../helpers/notice'
import { OtpCode } from '../helpers/otp-code'
import { Phone } from '../helpers/phone'
import { Query } from '../helpers/query'
import { Squads } from '../helpers/squads'
import { NetworkSource } from '../network/network-source'
import { SessionStore } from '../session/session-store'

/** Everything outside the app that core depends on. Tests pass fakes for any of it. */
export interface IDeps {
  /** Where the refresh token is kept between launches. */
  session: ISessionStore
  /** The helpers, created once here, so a test can pass its own. */
  helpers: {
    /** Sign-in code parsing. */
    code: OtpCode
    /** Error to message mapping. */
    errors: ErrorKey
    /** Connection notice phases. */
    notice: Notice
    /** Phone number parsing and formatting. */
    phone: Phone
    /** The query client's retry policy. */
    query: Query
    /** Squad model mapping and cache refreshes, on the query client below. */
    squads: Squads
  }
  /** Whether the device has internet, and when that changes. */
  network: INetworkSource
  /** The phone numbers in the person's address book, once they allow it. */
  contacts: IContactsSource
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
   * Builds the dependencies: the platform's session store, the network source, the contacts
   * source, a query client, the helpers and the clock, with the caller's overrides on top. The
   * query client comes first, so the helpers are built on the one in use, a test's included.
   * @param overrides - Replaces any of the real dependencies, which tests use to pass fakes.
   * @returns The dependencies.
   */
  static create(overrides: Partial<IDeps> = {}): IDeps {
    const query = new Query()
    const queryClient = overrides.queryClient ?? Deps.queryClient(query)

    return {
      contacts: ContactsSource.create(),
      helpers: Deps.helpers(queryClient, query),
      /**
       * Reads the system clock.
       * @returns Milliseconds since the epoch.
       */
      now: () => Date.now(),
      network: NetworkSource.create(),
      queryClient,
      session: SessionStore.create(),
      ...overrides,
    }
  }

  /**
   * Builds the query client, retrying failed queries by the query helper's policy.
   * @param query - The retry policy.
   * @returns A client whose queries retry by that policy.
   */
  private static queryClient(query: Query): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          /**
           * Asks the policy whether to try again. A wrapper, since the client calls it bare.
           * @param failureCount - How many times the query has failed so far.
           * @param error - What it failed with.
           * @returns True to try again.
           */
          retry: (failureCount: number, error: unknown): boolean =>
            query.shouldRetry(failureCount, error),
        },
      },
    })
  }

  /**
   * Creates one of each helper.
   * @param queryClient - The cache the squad helpers refresh.
   * @param query - The retry policy, already built for the query client.
   * @returns OtpCode, ErrorKey, Notice, Phone, Query and Squads, keyed as IDeps names them.
   */
  private static helpers(queryClient: QueryClient, query: Query): IDeps['helpers'] {
    return {
      code: new OtpCode(),
      errors: new ErrorKey(),
      notice: new Notice(),
      phone: new Phone(),
      query,
      squads: new Squads(queryClient),
    }
  }
}
