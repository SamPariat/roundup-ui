import { Platform } from 'react-native'

import { ApiError } from '../src/api-error'
import { setAuthBridge } from '../src/auth-bridge'
import { fetcher } from '../src/fetcher'

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
 * Builds a JSON response the way the gateway sends one.
 * @param status - The HTTP status.
 * @param body - The value to serialize as the body.
 * @param headers - Extra response headers.
 * @returns The response.
 */
const json = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  Response.json(body, { headers, status })

/**
 * Builds a response with no body.
 * @param status - The HTTP status.
 * @returns The response.
 */
const empty = (status: number): Response => new Response(null, { status })

/**
 * A stand-in for Platform.select that answers as the web would.
 * @param spec - The per-platform values.
 * @returns The web value, or the default.
 */
const selectWeb = (spec: Record<string, unknown>): unknown => spec['web'] ?? spec['default']

/**
 * Reads the headers of one request the stub received.
 * @param call - The zero-based index of the request.
 * @returns Its headers.
 */
const sentHeaders = (call: number): Headers => new Headers(fetchMock.mock.calls[call]?.[1].headers)

/**
 * Hands out the current test token.
 * @returns The bearer token string.
 */
const currentToken = (): string => token

/**
 * Runs the current refresh mock.
 * @returns What the mock resolves.
 */
const runRefresh = (): Promise<boolean> => refresh()

/**
 * Waits one macrotask, so every pending request has reached its refresh.
 * @returns A promise that resolves on the next tick of the event loop.
 */
const tick = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

describe('fetcher', () => {
  beforeEach(() => {
    fetchMock = jest.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch
    token = 'access-1'
    refresh = jest.fn(() => Promise.resolve(false))
    setAuthBridge({ getAccessToken: currentToken, refresh: runRefresh })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the parsed envelope from the configured base url', async () => {
    fetchMock.mockResolvedValue(json(200, { data: { id: 'u1' }, success: true }))

    const result = await fetcher<IEnvelope<IIdentified>>('/api/v1/users/me', { method: 'GET' })

    expect(result.data.id).toBe('u1')
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/v1/users/me')
  })

  it.each([202, 204])('resolves undefined for a %i', async (status) => {
    fetchMock.mockResolvedValue(empty(status))

    await expect(fetcher('/api/v1/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws an ApiError with status, message and request id', async () => {
    fetchMock.mockResolvedValue(
      json(429, { error: 'too many requests', success: false }, { 'X-Request-ID': 'req-9' }),
    )

    const failure = await fetcher('/api/v1/auth/otp/request', { method: 'POST' }).catch(
      (error: unknown) => error,
    )

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure).toMatchObject({ message: 'too many requests', requestId: 'req-9', status: 429 })
  })

  it('turns a network failure into status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({ status: 0 })
  })

  it('sends the client kind, JSON accept and the bearer token on native', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))

    await fetcher('/api/v1/users/me')

    expect(sentHeaders(0).get('X-Client')).toBe('ios')
    expect(sentHeaders(0).get('Accept')).toBe('application/json')
    expect(sentHeaders(0).get('Authorization')).toBe('Bearer access-1')
    expect(fetchMock.mock.calls[0]?.[1].credentials).toBeUndefined()
  })

  it('sends X-Client web and includes cookies on web', async () => {
    jest.spyOn(Platform, 'select').mockImplementation(selectWeb)
    fetchMock.mockResolvedValue(json(200, { success: true }))

    await fetcher('/api/v1/users/me')

    expect(sentHeaders(0).get('X-Client')).toBe('web')
    expect(fetchMock.mock.calls[0]?.[1].credentials).toBe('include')
  })

  it('refreshes once on a 401 and retries with the new token', async () => {
    token = 'old'

    refresh.mockImplementation(() => {
      token = 'new'

      return Promise.resolve(true)
    })

    fetchMock
      .mockResolvedValueOnce(json(401, { error: 'expired', success: false }))
      .mockResolvedValueOnce(json(200, { data: 7, success: true }))

    const result = await fetcher<IEnvelope<number>>('/api/v1/users/me')

    expect(result.data).toBe(7)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(sentHeaders(1).get('Authorization')).toBe('Bearer new')
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
        stale ? json(401, { error: 'expired', success: false }) : json(200, { success: true }),
      )
    })

    const calls = Promise.all([fetcher('/api/v1/a'), fetcher('/api/v1/b'), fetcher('/api/v1/c')])

    await tick()

    expect(refresh).toHaveBeenCalledTimes(1)

    waiting[0]?.()
    await calls

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('does not loop when the refresh fails', async () => {
    fetchMock.mockResolvedValue(json(401, { error: 'expired', success: false }))

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({ status: 401 })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not refresh when an auth route answers 401', async () => {
    refresh.mockResolvedValue(true)
    fetchMock.mockResolvedValue(json(401, { error: 'invalid code', success: false }))

    await expect(fetcher('/api/v1/auth/otp/verify', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
    })

    expect(refresh).not.toHaveBeenCalled()
  })

  it('retries only once when the retry also gets a 401', async () => {
    refresh.mockResolvedValue(true)
    fetchMock.mockResolvedValue(json(401, { error: 'expired', success: false }))

    await expect(fetcher('/api/v1/users/me')).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
