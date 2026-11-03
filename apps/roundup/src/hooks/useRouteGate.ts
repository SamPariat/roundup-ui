import { useSession } from '@roundup/core'

/**
 * Which part of the app the session allows: nothing yet while it restores or loads the profile,
 * the signed-out screens, or the signed-in app.
 */
export type RouteGate = 'loading' | 'signedIn' | 'signedOut'

/**
 * Turns the session into the one answer the route guards need.
 * @returns loading until the saved session has been checked, then signedOut or signedIn.
 */
export const useRouteGate = (): RouteGate => {
  const { status } = useSession()

  if (status === 'restoring') return 'loading'

  return status
}
