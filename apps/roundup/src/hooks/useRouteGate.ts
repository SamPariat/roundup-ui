import { useMe, useSession } from '@roundup/core'

/**
 * Which part of the app the session allows: nothing yet while it restores or loads the profile,
 * the signed-out screens, the name step for a profile with no name, or the signed-in app.
 */
export type TRouteGate = 'loading' | 'needsName' | 'signedIn' | 'signedOut'

/**
 * Turns the session and the profile into the one answer the route guards need.
 * @returns loading until the saved session and profile have been checked, then one of the rest.
 */
export const useRouteGate = (): TRouteGate => {
  const { status } = useSession()
  const { loading, needsName } = useMe()

  if (status === 'restoring') return 'loading'

  if (status === 'signedOut') return 'signedOut'

  if (loading) return 'loading'

  return needsName ? 'needsName' : 'signedIn'
}
