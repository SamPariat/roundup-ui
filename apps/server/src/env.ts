import path from 'node:path'

export interface ServerEnv {
  readonly port: number
  /** Folder with the Expo web export. */
  readonly distDir: string
  /** Extra origin the page may call, for the Content-Security-Policy `connect-src`. */
  readonly apiOrigin: string | undefined
}

export class ServerEnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerEnvError'
  }
}

const DEFAULT_PORT = 3000
const MAX_PORT = 65_535

export const readServerEnv = (
  raw: Readonly<Record<string, string | undefined>>,
  cwd: string,
): ServerEnv => {
  const portText = raw['PORT']
  const port = portText === undefined || portText === '' ? DEFAULT_PORT : Number(portText)
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
    throw new ServerEnvError(
      `PORT must be a whole number from 1 to ${String(MAX_PORT)}, got "${String(portText)}"`,
    )
  }

  const apiOrigin = raw['API_ORIGIN']
  if (apiOrigin !== undefined && apiOrigin !== '') {
    try {
      new URL(apiOrigin)
    } catch {
      throw new ServerEnvError(`API_ORIGIN must be a URL, got "${apiOrigin}"`)
    }
  }

  return Object.freeze({
    port,
    distDir: path.resolve(cwd, raw['DIST_DIR'] ?? '../app/dist'),
    apiOrigin: apiOrigin === undefined || apiOrigin === '' ? undefined : new URL(apiOrigin).origin,
  })
}
