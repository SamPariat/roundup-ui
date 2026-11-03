import { QueryClient } from '@tanstack/react-query'

import type { IDeps } from '@roundup/core'

/** The user the stubbed profile route returns. */
interface IStubUser {
  /** The name; empty until the person sets one. */
  name: string
}

/** What a test says the backend does. */
export interface IBackend {
  /** The profile route's user. */
  user: IStubUser
  /** True to make the refresh route hang, so the session stays in "restoring". */
  hang?: boolean
  /** The status the request-code route answers with. Defaults to 202. */
  otp?: number
  /** How the verify route answers: a returning user, a new user, or a wrong code. */
  verify?: 'existing' | 'new' | 'wrong'
  /** True to make the request-code route hang, so a button stays busy. */
  hangOtp?: boolean
  /** True to make the verify route hang, so the Verify button stays busy. */
  hangVerify?: boolean
  /** Paths of the requests made, in order. */
  paths: string[]
}

/**
 * A session store that keeps its token in memory, like the Keychain would between launches.
 */
class MemoryStore {
  /** Native stores hold the token themselves. */
  readonly cookie = false

  /** The token "in the Keychain". */
  private token: string | undefined

  /**
   * Builds the store.
   * @param token - The refresh token saved by an earlier launch, if any.
   */
  constructor(token?: string) {
    this.token = token
  }

  /**
   * Forgets the token.
   * @returns A resolved promise.
   */
  clear(): Promise<void> {
    this.token = undefined

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
   * Remembers the token.
   * @param refreshToken - The token to keep.
   * @returns A resolved promise.
   */
  save(refreshToken: string): Promise<void> {
    this.token = refreshToken

    return Promise.resolve()
  }
}

/**
 * A request that never answers.
 * @returns A promise that stays pending.
 */
const hang = (): Promise<boolean> => new Promise<boolean>(() => false)

/**
 * Builds a JSON response in the gateway's envelope.
 * @param data - The payload.
 * @param status - The HTTP status.
 * @returns The response.
 */
const envelope = (data: unknown, status = 200): Response =>
  Response.json({ data, success: true }, { status })

/**
 * Builds the profile the users route returns.
 * @param name - The name on the profile.
 * @returns The response.
 */
const profile = (name: string): Response =>
  envelope({
    avatarURL: '',
    createdAt: '2026-01-01T00:00:00Z',
    id: 'u1',
    name,
    phone: '+919876543210',
    updatedAt: '2026-01-01T00:00:00Z',
  })

/**
 * Builds a token pair for the auth routes.
 * @param refreshToken - The refresh token in the pair.
 * @param extra - Extra fields, such as the login response's isNewUser.
 * @returns The response.
 */
const tokens = (refreshToken: string, extra: Record<string, unknown> = {}): Response =>
  envelope({
    accessToken: 'access',
    accessTokenExpiresAt: '2030-01-01T00:00:00Z',
    refreshToken,
    refreshTokenExpiresAt: '2030-02-01T00:00:00Z',
    ...extra,
  })

/**
 * Answers the sign-in routes: request code and verify.
 * @param path - The request path.
 * @param backend - What the backend is told to do.
 * @returns The response, or undefined when the path is not a sign-in route.
 */
const signInAnswer = async (path: string, backend: IBackend): Promise<Response | undefined> => {
  if (path === '/api/v1/auth/otp/request') {
    if (backend.hangOtp === true) await hang()

    return backend.otp === undefined || backend.otp === 202
      ? new Response(null, { status: 202 })
      : Response.json(
          { error: 'nope', success: false },
          { headers: { 'X-Request-ID': 'req-7' }, status: backend.otp },
        )
  }

  if (path === '/api/v1/auth/otp/verify') {
    if (backend.hangVerify === true) await hang()

    return backend.verify === 'wrong'
      ? Response.json({ error: 'invalid or expired code', success: false }, { status: 401 })
      : tokens('r1', { isNewUser: backend.verify === 'new', userID: 'u1' })
  }

  return undefined
}

/**
 * Replaces global fetch with a backend that knows sign-in, refresh, the profile and logout.
 * @param backend - What the backend answers and where requests are recorded.
 */
export const stubBackend = (backend: IBackend): void => {
  globalThis.fetch = (async (input: string, init?: RequestInit) => {
    const path = input.replace('http://localhost:8080', '')
    const method = init?.method ?? 'GET'

    backend.paths.push(`${method} ${path}`)

    if (path === '/api/v1/auth/refresh') {
      if (backend.hang === true) await hang()

      return tokens('r2')
    }

    if (path === '/api/v1/auth/logout') return new Response(null, { status: 204 })

    if (path === '/api/v1/users/me') return profile(method === 'PATCH' ? 'Asha' : backend.user.name)

    const answer = await signInAnswer(path, backend)

    if (answer === undefined) throw new Error(`No stub for ${path}`)

    return answer
  }) as typeof fetch
}

/**
 * Builds the dependencies of a test: a store with or without a saved session, and a query client
 * that never garbage-collects, whose timer would keep Jest alive.
 * @param token - The saved refresh token; none means a signed-out launch.
 * @returns IDeps to pass to CoreProvider.
 */
export const testDeps = (token?: string): Partial<IDeps> => ({
  queryClient: new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } }),
  session: new MemoryStore(token),
})
