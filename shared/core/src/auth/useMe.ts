import type { User } from '@roundup/api'

import { useGetMe } from '@roundup/api'

import { useSession } from '../session/useSession'

/** The signed-in person's profile as the app needs it. */
export interface IMe {
  /** The profile, once loaded. */
  me: undefined | User
  /** True while the profile is loading for a signed-in session. */
  loading: boolean
  /** True when the profile loaded and its name is still empty, so the name step is due. */
  needsName: boolean
}

/**
 * Loads the profile while signed in. A profile that failed to load does not count as nameless, so
 * a lost connection never sends a returning person back to the name step.
 * @returns The profile, whether it is loading, and whether a name is missing.
 */
export const useMe = (): IMe => {
  const { status } = useSession()
  const signedIn = status === 'signedIn'
  const query = useGetMe({ query: { enabled: signedIn } })
  const me = signedIn ? query.data?.data : undefined

  return {
    loading: signedIn && query.isPending,
    me,
    needsName: me?.name.trim() === '',
  }
}
