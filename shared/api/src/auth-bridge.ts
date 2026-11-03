/**
 * What the fetcher needs from the session without knowing about it. The core package implements
 * it, so this package stays free of session code.
 */
export interface AuthBridge {
  /** The access token to send as a bearer token, or undefined when signed out. */
  getAccessToken: () => string | undefined
  /** Gets a new token pair; resolves true when a fresh access token is now available. */
  refresh: () => Promise<boolean>
}

let current: AuthBridge | undefined

/**
 * Installs (or, with undefined, removes) the session bridge the fetcher calls.
 * @param bridge - The bridge to use from now on.
 */
export const setAuthBridge = (bridge: AuthBridge | undefined): void => {
  current = bridge
}

/**
 * Reads the installed bridge.
 * @returns The bridge, or undefined when none is installed.
 */
export const getAuthBridge = (): AuthBridge | undefined => current
