import type { User } from '@roundup/api'

import { useSession } from '../session/useSession.ts'
import { useMe } from './useMe.ts'

/** What the profile tab shows and does. */
export interface ProfileViewModel {
  /** The signed-in person, once loaded. */
  me: undefined | User
  /** True while the profile loads. */
  loading: boolean
  /** Logs out; the route guard then returns to Welcome. */
  signOut: () => Promise<void>
}

/**
 * The view model of the profile tab.
 * @returns The profile and the log out action.
 */
export const useProfileViewModel = (): ProfileViewModel => {
  const { loading, me } = useMe()
  const { signOut } = useSession()

  return { loading, me, signOut }
}
