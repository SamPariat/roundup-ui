import type { ISessionStore } from './types'

/**
 * Builds the session store. Static methods only. The native version of this file
 * (session-store.native.ts) has the same class and API.
 */
export class SessionStore {
  /**
   * The web session store. It keeps nothing: the browser holds the refresh token in an httpOnly
   * cookie, and the access token lives only in memory (session.ts).
   * @returns A store whose methods do nothing.
   */
  static create(): ISessionStore {
    return {
      /**
       * Nothing is saved, so there is nothing to forget.
       * @returns A resolved promise.
       */
      clear: () => Promise.resolve(),
      cookie: true,
      /**
       * The cookie is httpOnly, so scripts never see the token.
       * @returns Always undefined.
       */
      refreshToken: (): string | undefined => undefined,
      /**
       * Nothing is saved, so there is nothing to load.
       * @returns A resolved promise.
       */
      restore: () => Promise.resolve(),
      /**
       * The server sets the cookie, so there is nothing to save.
       * @returns A resolved promise.
       */
      save: () => Promise.resolve(),
    }
  }
}
