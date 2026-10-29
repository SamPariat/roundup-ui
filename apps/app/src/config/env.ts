export interface Env {
  readonly apiUrl: string
}

export type RawEnv = Readonly<Record<'EXPO_PUBLIC_API_URL', string | undefined>>

export class EnvError extends Error {
  constructor(message: string) {
    super(`${message}. Copy apps/app/.env.beta.example to .env.beta (make setup) and restart.`)
    this.name = 'EnvError'
  }
}

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

export const readEnv = (raw: RawEnv): Env =>
  Object.freeze({ apiUrl: requireUrl('EXPO_PUBLIC_API_URL', raw.EXPO_PUBLIC_API_URL) })

// Expo inlines process.env.EXPO_PUBLIC_* by static text, so each key is spelled out here.
export const env: Env = readEnv({ EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL })
