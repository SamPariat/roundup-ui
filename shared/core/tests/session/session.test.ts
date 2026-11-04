import { QueryClient } from '@tanstack/react-query'

import type { ISession } from '../../src/session/session'

import { Session } from '../../src/session/session'
import { Fakes, FakeStore } from '../helpers/fakes'

/** The query client the session clears on sign-out. */
let queryClient: QueryClient

/**
 * Session test helpers. Static methods only.
 */
class SessionTestHelper {
  /**
   * Builds a session over a store.
   * @param store - The store to use.
   * @returns The session under test.
   */
  static build(store: FakeStore): ISession {
    return Session.create({ queryClient, store })
  }

  /**
   * Builds a token pair as the type the session takes.
   * @param access - The access token.
   * @param refresh - The refresh token, or none for the web shape.
   * @returns The pair.
   */
  static tokens(access: string, refresh?: string): Parameters<ISession['signIn']>[0] {
    return Fakes.pair(access, refresh) as unknown as Parameters<ISession['signIn']>[0]
  }
}

describe('session', () => {
  beforeEach(() => {
    queryClient = new QueryClient()
  })

  describe('restore', () => {
    it('signs in with the saved refresh token and saves the rotated one', async () => {
      const store = new FakeStore('r1')

      const network = Fakes.stubNetwork({
        'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
      })

      const session = SessionTestHelper.build(store)

      expect(session.getState().status).toBe('restoring')

      await session.restore()

      expect(session.getState().status).toBe('signedIn')
      expect(session.getAccessToken()).toBe('a2')
      expect(store.saved).toEqual(['r2'])
      expect(network.requests[0]?.body).toEqual({ refreshToken: 'r1' })
    })

    it('is signed out and skips the network when native has nothing saved', async () => {
      const network = Fakes.stubNetwork({})
      const session = SessionTestHelper.build(new FakeStore())

      await session.restore()

      expect(session.getState().status).toBe('signedOut')
      expect(network.requests).toHaveLength(0)
    })

    it('forgets a refresh token the server rejects', async () => {
      const store = new FakeStore('r1')

      Fakes.stubNetwork({
        'POST /api/v1/auth/refresh': Fakes.failure(401, 'invalid refresh token'),
      })

      const session = SessionTestHelper.build(store)

      await session.restore()

      expect(session.getState().status).toBe('signedOut')
      expect(store.refreshToken()).toBeUndefined()
      expect(store.cleared).toBe(1)
    })

    it('keeps the saved token when the network is down', async () => {
      const store = new FakeStore('r1')

      Fakes.goOffline()

      const session = SessionTestHelper.build(store)

      await session.restore()

      expect(session.getState().status).toBe('signedOut')
      expect(store.refreshToken()).toBe('r1')
    })

    it('asks the server with no body on web, where the cookie holds the token', async () => {
      const store = new FakeStore(undefined, true)
      const network = Fakes.stubNetwork({ 'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2')) })
      const session = SessionTestHelper.build(store)

      await session.restore()

      expect(session.getState().status).toBe('signedIn')
      expect(network.requests[0]?.body).toBeUndefined()
      expect(store.saved).toEqual([])
    })

    it('runs only once however often it is called', async () => {
      const network = Fakes.stubNetwork({
        'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
      })

      const session = SessionTestHelper.build(new FakeStore('r1'))

      await Promise.all([session.restore(), session.restore()])

      expect(network.requests).toHaveLength(1)
    })
  })

  describe('signIn', () => {
    it('saves the refresh token and keeps the access token in memory', async () => {
      const store = new FakeStore()
      const session = SessionTestHelper.build(store)

      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))

      expect(session.getState().status).toBe('signedIn')
      expect(session.getAccessToken()).toBe('a1')
      expect(store.saved).toEqual(['r1'])
    })

    it('rejects a native pair without a refresh token', async () => {
      const session = SessionTestHelper.build(new FakeStore())

      await expect(session.signIn(SessionTestHelper.tokens('a1'))).rejects.toThrow(
        'no refresh token',
      )

      expect(session.getState().status).toBe('restoring')
    })

    it('saves nothing on web', async () => {
      const store = new FakeStore(undefined, true)
      const session = SessionTestHelper.build(store)

      await session.signIn(SessionTestHelper.tokens('a1'))

      expect(session.getState().status).toBe('signedIn')
      expect(store.saved).toEqual([])
    })

    it('tells subscribers about the change', async () => {
      const session = SessionTestHelper.build(new FakeStore())
      const listener = jest.fn()

      session.subscribe(listener)
      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('signOut', () => {
    it('revokes the session, clears the store and the query cache', async () => {
      const store = new FakeStore()
      const network = Fakes.stubNetwork({ 'POST /api/v1/auth/logout': Fakes.empty(204) })
      const session = SessionTestHelper.build(store)
      const clear = jest.spyOn(queryClient, 'clear')

      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))
      await session.signOut()

      expect(network.requests[0]?.body).toEqual({ refreshToken: 'r1' })
      expect(session.getState().status).toBe('signedOut')
      expect(session.getAccessToken()).toBeUndefined()
      expect(store.cleared).toBe(1)
      expect(clear).toHaveBeenCalledTimes(1)
    })

    it('clears local state even when the network is down', async () => {
      const store = new FakeStore()
      const session = SessionTestHelper.build(store)

      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))
      Fakes.goOffline()
      await session.signOut()

      expect(session.getState().status).toBe('signedOut')
      expect(store.refreshToken()).toBeUndefined()
    })
  })

  describe('refresh', () => {
    it('is shared between concurrent callers and saves the rotation', async () => {
      const store = new FakeStore('r1')

      const network = Fakes.stubNetwork({
        'POST /api/v1/auth/refresh': Fakes.ok(Fakes.pair('a2', 'r2')),
      })

      const session = SessionTestHelper.build(store)

      const results = await Promise.all([session.refresh(), session.refresh(), session.refresh()])

      expect(results).toEqual([true, true, true])
      expect(network.requests).toHaveLength(1)
      expect(store.saved).toEqual(['r2'])
    })

    it('signs out when the server rejects the token mid-session', async () => {
      Fakes.stubNetwork({ 'POST /api/v1/auth/refresh': Fakes.failure(401, 'reuse') })

      const session = SessionTestHelper.build(new FakeStore())

      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))

      await expect(session.refresh()).resolves.toBe(false)
      expect(session.getState().status).toBe('signedOut')
    })

    it('stays signed in when the network fails', async () => {
      const session = SessionTestHelper.build(new FakeStore())

      await session.signIn(SessionTestHelper.tokens('a1', 'r1'))
      Fakes.goOffline()

      await expect(session.refresh()).resolves.toBe(false)
      expect(session.getState().status).toBe('signedIn')
    })
  })
})
