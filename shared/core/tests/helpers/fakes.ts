import type { ISessionStore } from '../../src/session/types'

/** A session store that keeps its token in memory and records what core asked of it. */
export class FakeStore implements ISessionStore {
  /** True when this store behaves like the web one, which holds no token. */
  readonly cookie: boolean

  /** Every refresh token passed to save, in order. */
  readonly saved: string[] = []

  /** How many times clear was called. */
  cleared = 0

  /** The token "in the Keychain". */
  private token: string | undefined

  /**
   * Builds the store.
   * @param token - The refresh token already saved, if any.
   * @param cookie - True to behave like the web store.
   */
  constructor(token?: string, cookie = false) {
    this.cookie = cookie
    this.token = cookie ? undefined : token
  }

  /**
   * Forgets the token.
   * @returns A resolved promise.
   */
  clear(): Promise<void> {
    this.token = undefined
    this.cleared += 1

    return Promise.resolve()
  }

  /**
   * Reads the token.
   * @returns The token, or undefined.
   */
  refreshToken(): string | undefined {
    return this.token
  }

  /**
   * Does nothing: the token is already in memory.
   * @returns A resolved promise.
   */
  restore(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Remembers the token and records the call.
   * @param refreshToken - The token to save.
   * @returns A resolved promise.
   */
  save(refreshToken: string): Promise<void> {
    this.token = refreshToken
    this.saved.push(refreshToken)

    return Promise.resolve()
  }
}

/** What a stubbed route answers. */
export interface IRouteSpec {
  /** The HTTP status. */
  status: number
  /** The JSON body; none for 202 and 204. */
  body?: unknown
  /** Extra response headers. */
  headers?: Record<string, string>
  /** When set, the answer waits until this promise settles. */
  gate?: Promise<unknown>
}

/** The request a stubbed route received. */
interface IRecordedRequest {
  /** The path, such as /api/v1/auth/refresh. */
  path: string
  /** The HTTP method. */
  method: string
  /** The parsed JSON body, or undefined. */
  body: unknown
}

/** Everything a test needs to see of the fake network. */
export interface IStubbedNetwork {
  /** Every request, in order. */
  requests: IRecordedRequest[]
  /** The answers by "METHOD /path"; change an entry to change what the next request gets. */
  routes: Record<string, IRouteSpec>
}

/**
 * Replaces global fetch with a router keyed by "METHOD /path". An unknown route fails the test
 * loudly instead of reaching a real network.
 * @param routes - The answers by route.
 * @returns The record of requests and the live routes.
 */
export const stubNetwork = (routes: Record<string, IRouteSpec>): IStubbedNetwork => {
  const network: IStubbedNetwork = { requests: [], routes }

  globalThis.fetch = (async (input: string, init?: RequestInit) => {
    const path = input.replace('http://localhost:8080', '')
    const method = init?.method ?? 'GET'
    const text = typeof init?.body === 'string' ? init.body : undefined

    network.requests.push({
      body: text === undefined ? undefined : (JSON.parse(text) as unknown),
      method,
      path,
    })

    const spec = network.routes[`${method} ${path}`]

    if (spec === undefined) throw new Error(`No stub for ${method} ${path}`)

    await spec.gate

    return new Response(spec.body === undefined ? null : JSON.stringify(spec.body), {
      headers: spec.headers ?? {},
      status: spec.status,
    })
  }) as typeof fetch

  return network
}

/**
 * A fetch that never connects.
 * @returns A promise that rejects the way a lost connection does.
 */
const rejectOffline = (): Promise<Response> => Promise.reject(new TypeError('offline'))

/**
 * Makes every request fail the way a missing connection does.
 */
export const goOffline = (): void => {
  globalThis.fetch = rejectOffline
}

/**
 * Builds the success envelope the gateway wraps data in.
 * @param data - The payload.
 * @returns A 200 answer.
 */
export const ok = (data: unknown): IRouteSpec => ({ body: { data, success: true }, status: 200 })

/**
 * Builds an answer that has no body, such as a 202 or 204.
 * @param status - The HTTP status.
 * @returns The answer.
 */
export const empty = (status: number): IRouteSpec => ({ status })

/**
 * Builds the failure envelope the gateway sends, with a request ID.
 * @param status - The HTTP status.
 * @param error - The error text.
 * @returns The answer.
 */
export const failure = (status: number, error: string): IRouteSpec => ({
  body: { error, success: false },
  headers: { 'X-Request-ID': 'req-1' },
  status,
})

/**
 * Builds a token pair the way the server returns one.
 * @param access - The access token.
 * @param refresh - The refresh token; leave out for the web shape, which has none.
 * @returns The pair in the JSON shape of the API.
 */
export const pair = (access: string, refresh?: string): Record<string, unknown> => ({
  accessToken: access,
  accessTokenExpiresAt: '2030-01-01T00:00:00Z',
  refreshTokenExpiresAt: '2030-02-01T00:00:00Z',
  ...(refresh === undefined ? {} : { refreshToken: refresh }),
})

/**
 * Builds a login response for the verify route.
 * @param isNewUser - Whether this is the person's first sign-in.
 * @returns The answer.
 */
export const login = (isNewUser: boolean): IRouteSpec =>
  ok({ ...pair('a1', 'r1'), isNewUser, userID: 'u1' })
