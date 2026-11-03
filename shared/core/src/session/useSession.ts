import { use, useSyncExternalStore } from 'react'

import type { TokenPair } from '@roundup/api'

import type { TSessionStatus } from './types'

import { SessionContext } from '../di/context'

/** What useSession gives a screen. */
export interface IUseSession {
  /** restoring until the launch refresh settles, then signedIn or signedOut. */
  status: TSessionStatus
  /** Takes the tokens from a successful code check. */
  signIn: (pair: TokenPair) => Promise<void>
  /** Logs out, offline or not, and clears local data. */
  signOut: () => Promise<void>
}

/**
 * Reads the session of the nearest CoreProvider and re-renders when its status changes.
 * @returns The status and the sign-in and sign-out actions.
 */
export const useSession = (): IUseSession => {
  const session = use(SessionContext)

  if (session === null) throw new Error('useSession needs a CoreProvider above it')

  const state = useSyncExternalStore(session.subscribe, session.getState, session.getState)

  return { signIn: session.signIn, signOut: session.signOut, status: state.status }
}
