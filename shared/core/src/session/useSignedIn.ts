import { useSession } from './useSession'

/**
 * Whether the session is signed in, so a query waits for it instead of asking while signed out.
 * @returns True once the session is signed in.
 */
export const useSignedIn = (): boolean => useSession().status === 'signedIn'
