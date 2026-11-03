/**
 * Where the refresh token lives between launches. Native keeps it in the Keychain/Keystore; the
 * web keeps nothing, because the browser holds it in an httpOnly cookie that scripts cannot read.
 */
export interface ISessionStore {
  /** True when the refresh token travels as a cookie, so a refresh needs no stored token. */
  readonly cookie: boolean
  /** Loads the saved refresh token into memory. Call once at launch, before reading it. */
  restore: () => Promise<void>
  /** Saves the refresh token the server just issued (every refresh rotates it). */
  save: (refreshToken: string) => Promise<void>
  /** Forgets the saved refresh token. */
  clear: () => Promise<void>
  /** The refresh token loaded or saved so far; always undefined where the cookie holds it. */
  refreshToken: () => string | undefined
}

/** Where the person is in signing in. */
export type TSessionStatus = 'restoring' | 'signedIn' | 'signedOut'

/** What a screen can learn about the session. */
export interface ISessionState {
  /** restoring until the launch refresh has settled, then signedIn or signedOut. */
  status: TSessionStatus
}
