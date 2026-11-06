import { Platform } from 'react-native'

import { ApiError } from '../src/api-error'
import { AuthBridge } from '../src/auth-bridge'
import { fetcher } from '../src/fetcher'
import { HttpStatus } from '../src/http-status'

/** The envelope tests read back. */
interface IEnvelope<T> {
  /** The payload. */
  data: T
}

/** A payload with an id. */
interface IIdentified {
  /** The id. */
  id: string
}

/** The fetch stub, replaced before every test. */
let fetchMock: jest.Mock<Promise<Response>, [string, RequestInit]>

/** The access token the installed bridge hands out. */
let token = 'access-1'

/** The refresh the installed bridge runs; each test decides what it does. */
let refresh: jest.Mock<Promise<boolean>, []>

/**
 * Fetcher test helpers. Static methods only.
 */
class FetcherFixtures {
  /**
   * Builds a JSON response the way the gateway sends one.
   * @param status - The HTTP status.
   * @param body - The value to serialize as the body.
   * @param headers - Extra response headers.
   * @returns The response.
   */
  static json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    return Response.json(body, { headers, status })
  }

  /**
   * Builds a response with no body.
   * @param status - The HTTP status.
   * @returns The response.
   */
  static empty(status: number): Response {
    return new Response(null, { status })
  }

  /**
   * A stand-in for Platform.select that answers as the web would.
   * @param spec - The per-platform values.
   * @returns The web value, or the default.
   */
  static selectWeb(spec: Record<string, unknown>): unknown {
    return spec['web'] ?? spec['default']
  }

  /**
   * Reads the headers of one request the stub received.
   * @param call - The zero-based index of the request.
   * @returns Its headers.
   */
  static sentHeaders(call: number): Headers {
    return new Headers(fetchMock.mock.calls[call]?.[1].headers)
  }

  /**
   * Hands out the current test token.
   * @returns The bearer token string.
   */
  static currentToken(): string {
    return token
  }

  /**
   * Runs the current refresh mock.
   * @returns What the mock resolves.
   */
  static runRefresh(): Promise<boolean> {
    return refresh()
  }

  /**
   * Waits one macrotask, so every pending request has reached its refresh.
   * @returns A promise that resolves on the next tick of the event loop.
   */
  static tick(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
  }
}

describe('fetcher', () => {
  beforeEach(() => {
    fetchMock = jest.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch
    token = 'access-1'
    refresh = jest.fn(() => Promise.resolve(false))

    AuthBridge.set({
      /**
       * Hands out the current test token.
       * @returns The bearer token string.
       */
      getAccessToken: () => FetcherFixtures.currentToken(),
      /**
       * Runs the current refresh mock.
       * @returns What the mock resolves.
       */
      refresh: () => FetcherFixtures.runRefresh(),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the parsed envelope from the configured base url', async () => {
    fetchMock.mockResolvedValue(
      FetcherFixtures.json(HttpStatus.ok, { data: { id: 'u1' }, success: true }),
    )

    const result = await fetcher<IEnvelope<IIdentified>>('/api/v1/users/me', { method: 'GET' })

    expect(result.data.id).toBe('u1')
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/v1/users/me')
  })

  it.each([HttpStatus.accepted, HttpStatus.noContent])(
    'resolves undefined for a %i',
    async (status) => {
      fetchMock.mockResolvedValue(FetcherFixtures.empty(status))

      await expect(fetcher('/api/v1/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
    },
  )

  it('throws an ApiError with status, message and request id', async () => {
    fetchMock.mockResolvedValue(
      FetcherFixtures.json(
        HttpStatus.tooManyRequests,
        { error: 'too many requests', success: false },
        { 'X-Request-ID': 'req-9' },
      ),
    )

    const failure = await fetcher('/api/v1/auth/otp/request', { method: 'POST' }).catch(
      (error: unknown) => error,
    )

    expect(failure).toBeInstanceOf(ApiError)

    expect(failure).toMatchObject({
      message: 'too many requests',
      requestId: 'req-9',
      status: HttpStatus.tooManyRequests,
    })
  })

  it('turns a network failure into status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({
      status: HttpStatus.noResponse,
    })
  })

  it('sends the client kind, JSON accept and the bearer token on native', async () => {
    fetchMock.mockResolvedValue(FetcherFixtures.json(HttpStatus.ok, { success: true }))

    await fetcher('/api/v1/users/me')

    expect(FetcherFixtures.sentHeaders(0).get('X-Client')).toBe('ios')
    expect(FetcherFixtures.sentHeaders(0).get('Accept')).toBe('application/json')
    expect(FetcherFixtures.sentHeaders(0).get('Authorization')).toBe('Bearer access-1')
    expect(fetchMock.mock.calls[0]?.[1].credentials).toBeUndefined()
  })

  it('sends X-Client web and includes cookies on web', async () => {
    jest.spyOn(Platform, 'select').mockImplementation((spec) => FetcherFixtures.selectWeb(spec))
    fetchMock.mockResolvedValue(FetcherFixtures.json(HttpStatus.ok, { success: true }))

    await fetcher('/api/v1/users/me')

    expect(FetcherFixtures.sentHeaders(0).get('X-Client')).toBe('web')
    expect(fetchMock.mock.calls[0]?.[1].credentials).toBe('include')
  })

  it('refreshes once on a 401 and retries with the new token', async () => {
    token = 'old'

    refresh.mockImplementation(() => {
      token = 'new'

      return Promise.resolve(true)
    })

    fetchMock
      .mockResolvedValueOnce(
        FetcherFixtures.json(HttpStatus.unauthorized, { error: 'expired', success: false }),
      )
      .mockResolvedValueOnce(FetcherFixtures.json(HttpStatus.ok, { data: 7, success: true }))

    const result = await fetcher<IEnvelope<number>>('/api/v1/users/me')

    expect(result.data).toBe(7)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(FetcherFixtures.sentHeaders(1).get('Authorization')).toBe('Bearer new')
  })

  it('shares one refresh between concurrent 401s', async () => {
    const waiting: (() => void)[] = []

    token = 'old'

    refresh.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          waiting.push(() => {
            token = 'new'
            resolve(true)
          })
        }),
    )

    fetchMock.mockImplementation((_url, init) => {
      const stale = new Headers(init.headers).get('Authorization') === 'Bearer old'

      return Promise.resolve(
        stale
          ? FetcherFixtures.json(HttpStatus.unauthorized, { error: 'expired', success: false })
          : FetcherFixtures.json(HttpStatus.ok, { success: true }),
      )
    })

    const calls = Promise.all([fetcher('/api/v1/a'), fetcher('/api/v1/b'), fetcher('/api/v1/c')])

    await FetcherFixtures.tick()

    expect(refresh).toHaveBeenCalledTimes(1)

    waiting[0]?.()
    await calls

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('does not loop when the refresh fails', async () => {
    fetchMock.mockResolvedValue(
      FetcherFixtures.json(HttpStatus.unauthorized, { error: 'expired', success: false }),
    )

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({
      status: HttpStatus.unauthorized,
    })

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when an auth route answers 401', async () => {
    refresh.mockResolvedValue(true)

    fetchMock.mockResolvedValue(
      FetcherFixtures.json(HttpStatus.unauthorized, { error: 'invalid code', success: false }),
    )

    await expect(fetcher('/api/v1/auth/otp/verify', { method: 'POST' })).rejects.toMatchObject({
      status: HttpStatus.unauthorized,
    })

    expect(refresh).not.toHaveBeenCalled()
  })

  it('retries only once when the retry also gets a 401', async () => {
    refresh.mockResolvedValue(true)

    fetchMock.mockResolvedValue(
      FetcherFixtures.json(HttpStatus.unauthorized, { error: 'expired', success: false }),
    )

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({
      status: HttpStatus.unauthorized,
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
