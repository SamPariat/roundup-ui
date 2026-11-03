import { AFTER_FIRST_UNLOCK, deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'

import type { ISessionStore } from './types'

/** The Keychain/Keystore entry that holds the refresh token. */
const KEY = 'roundup.refresh'

/** Lets the item be read once the phone has been unlocked after a restart, so a background refresh works. */
const OPTIONS = { keychainAccessible: AFTER_FIRST_UNLOCK }

/**
 * The native session store: the refresh token goes in the Keychain (iOS) or Keystore (Android)
 * through expo-secure-store and is mirrored in memory after restore().
 * @returns The Keychain-backed session store.
 */
export const createSessionStore = (): ISessionStore => {
  let token: string | undefined

  return {
    /** Deletes the entry and forgets the in-memory copy. */
    clear: async () => {
      token = undefined
      await deleteItemAsync(KEY, OPTIONS)
    },
    cookie: false,
    /**
     * Reads the in-memory copy.
     * @returns The token, or undefined.
     */
    refreshToken: () => token,
    /** Loads the entry into memory. */
    restore: async () => {
      token = (await getItemAsync(KEY, OPTIONS)) ?? undefined
    },
    /**
     * Writes the entry and keeps the in-memory copy.
     * @param refreshToken - The token the server just issued.
     */
    save: async (refreshToken) => {
      token = refreshToken
      await setItemAsync(KEY, refreshToken, OPTIONS)
    },
  }
}
