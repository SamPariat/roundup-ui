/** The validated client configuration. */
export interface Env {
  /** Base URL of the Roundup API, without a trailing slash. */
  readonly apiUrl: string
}

/** The unvalidated variables, keyed as Expo inlines them. */
export type RawEnv = Readonly<Record<'EXPO_PUBLIC_API_URL', string | undefined>>

/** A configuration mistake, worded with the fix. */
export class EnvError extends Error {
  /**
   * Wraps the message with the setup instructions.
   * @param message - What is wrong with the configuration.
   */
  constructor(message: string) {
    super(`${message}. Copy apps/app/.env.beta.example to .env.beta (make setup) and restart.`)
    this.name = 'EnvError'
  }
}

/**
 * Checks that a variable is a set, valid, slash-free http(s) URL, so a bad address fails at startup rather than as a confusing network error later.
 * @param name - The variable name, used in the error message.
 * @param value - The raw value.
 * @returns The value, unchanged.
 */
const requireUrl = (name: string, value: string | undefined): string => {
  if (value === undefined || value === '') throw new EnvError(`${name} is not set`)
  let parsed: URL

  try {
    parsed = new URL(value)
  } catch {
    throw new EnvError(`${name} is not a valid URL: "${value}"`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new EnvError(`${name} must start with http:// or https://, got "${value}"`)
  }

  if (value.endsWith('/')) throw new EnvError(`${name} must not end with a slash: "${value}"`)

  return value
}

/**
 * Validates the raw variables and freezes the result.
 * @param raw - The unvalidated variables.
 * @returns The validated configuration.
 */
export const readEnv = (raw: RawEnv): Env =>
  Object.freeze({ apiUrl: requireUrl('EXPO_PUBLIC_API_URL', raw.EXPO_PUBLIC_API_URL) })

/** Expo inlines process.env.EXPO_PUBLIC_* by static text, so each key is spelled out here. */
export const env: Env = readEnv({ EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL })
