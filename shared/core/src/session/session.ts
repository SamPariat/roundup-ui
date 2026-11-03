import type { QueryClient } from '@tanstack/react-query'

import type { TokenPair } from '@roundup/api'

import { ApiError, logout, refreshTokens } from '@roundup/api'

import type { ISessionState, ISessionStore } from './types'

/** The statuses from the refresh route that mean the refresh token is no good. */
const REJECTED = new Set([400, 401])

/** The body of an auth request that carries the refresh token. */
interface IRefreshBody {
  /** The saved refresh token. */
  refreshToken: string
}

/** What the session needs from the outside. */
export interface ISessionDeps {
  /** Where the refresh token is kept between launches. */
  store: ISessionStore
  /** Emptied on sign-out so the next person never sees the last one's data. */
  queryClient: Pick<QueryClient, 'clear'>
}

/** The session state machine: in-memory access token, persisted refresh token, one status. */
export interface ISession {
  /** The current state; a new object on every change, so it suits useSyncExternalStore. */
  getState: () => ISessionState
  /** Calls the listener after every change; returns the unsubscribe function. */
  subscribe: (listener: () => void) => () => void
  /** The access token, kept in memory only. */
  getAccessToken: () => string | undefined
  /** Loads the saved token and tries one refresh. Runs once; later calls share the first run. */
  restore: () => Promise<void>
  /** Takes the pair from a successful verify. Rejects when a native pair has no refresh token. */
  signIn: (pair: TokenPair) => Promise<void>
  /** Revokes the session, ignoring network errors, and forgets everything local. */
  signOut: () => Promise<void>
  /** Rotates the pair. Resolves true when a fresh access token is available. Single-flight. */
  refresh: () => Promise<boolean>
}

/**
 * Builds the session. It owns the access token and the status, asks the store for the refresh
 * token, and talks to the auth routes through the generated client.
 * @param deps - The store and query client to use.
 * @param deps.queryClient - The query cache to empty on sign-out.
 * @param deps.store - Where the refresh token is kept.
 * @returns The state machine, ready to restore.
 */
export const createSession = ({ queryClient, store }: ISessionDeps): ISession => {
  const listeners = new Set<() => void>()
  let state: ISessionState = { status: 'restoring' }
  let accessToken: string | undefined
  let restoring: Promise<void> | undefined
  let refreshing: Promise<boolean> | undefined

  /**
   * Moves to a new status and tells the listeners, unless nothing changed.
   * @param status - The status to move to.
   */
  const setStatus = (status: ISessionState['status']): void => {
    if (state.status === status) return

    state = { status }

    for (const listener of listeners) listener()
  }

  /**
   * The request body that carries the refresh token. Web sends none, because its cookie does.
   * @returns The body, or undefined where the cookie holds the token.
   */
  const bodyFor = (): IRefreshBody | undefined => {
    const token = store.refreshToken()

    return token === undefined ? undefined : { refreshToken: token }
  }

  /**
   * Takes a token pair: keeps the access token in memory and saves the refresh token natively.
   * @param pair - The pair the server issued.
   */
  const adopt = async (pair: TokenPair): Promise<void> => {
    if (!store.cookie) {
      if (pair.refreshToken === undefined) throw new Error('The server sent no refresh token')

      await store.save(pair.refreshToken)
    }

    accessToken = pair.accessToken
  }

  /** Forgets the access token and the saved refresh token. */
  const forget = async (): Promise<void> => {
    accessToken = undefined
    await store.clear()
  }

  /**
   * Rotates the pair once. An answer that rejects the token ends the session; a network failure or
   * a 5xx does not, so the person stays signed in and the next call tries again.
   * @returns True when a fresh access token is available.
   */
  const runRefresh = async (): Promise<boolean> => {
    try {
      const { data } = await refreshTokens(bodyFor())

      await adopt(data)
      setStatus('signedIn')

      return true
    } catch (error) {
      if (ApiError.is(error) && REJECTED.has(error.status)) {
        await forget()
        setStatus('signedOut')
      }

      return false
    }
  }

  /**
   * Rotates the pair, sharing one request between callers that ask while it is running.
   * @returns True when a fresh access token is available.
   */
  const refresh = (): Promise<boolean> => {
    refreshing ??= runRefresh().finally(() => {
      refreshing = undefined
    })

    return refreshing
  }

  /**
   * Loads the saved token and tries one refresh. Native with nothing saved is signed out without
   * asking the server; web always asks, because the cookie is invisible from here.
   */
  const runRestore = async (): Promise<void> => {
    await store.restore()

    if (!store.cookie && store.refreshToken() === undefined) {
      setStatus('signedOut')

      return
    }

    if (!(await refresh())) setStatus('signedOut')
  }

  return {
    /**
     * Reads the in-memory access token.
     * @returns The token, or undefined when signed out.
     */
    getAccessToken: () => accessToken,
    /**
     * Reads the current state.
     * @returns The state object, which is replaced on every change.
     */
    getState: () => state,
    refresh,
    /**
     * Runs the launch restore once; later calls share the first run.
     * @returns A promise that settles when the restore has.
     */
    restore: () => {
      restoring ??= runRestore()

      return restoring
    },
    /**
     * Adopts the pair from a successful verify and becomes signed in.
     * @param pair - The tokens the server issued.
     */
    signIn: async (pair) => {
      await adopt(pair)
      setStatus('signedIn')
    },
    /** Revokes the session on the server if it can, then forgets everything local. */
    signOut: async () => {
      try {
        await logout(bodyFor())
      } catch {
        // Offline or already revoked: the local session ends either way.
      }

      await forget()
      queryClient.clear()
      setStatus('signedOut')
    },
    /**
     * Adds a listener for status changes.
     * @param listener - Called after every change.
     * @returns The function that removes the listener.
     */
    subscribe: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}
