import type defaultConfig from '../app.config.ts'

/** The shape of the config object app.config.ts exports. */
type AppConfig = typeof defaultConfig

/** The module app.config.ts compiles to. */
interface ConfigModule {
  /** The exported Expo config. */
  default: AppConfig
}

/**
 * Loads app.config.ts fresh with an APP_ENV, since the file reads it when it is first imported.
 * @param appEnv - The value of APP_ENV.
 * @returns The Expo config.
 */
const loadConfig = (appEnv: string): AppConfig => {
  process.env.APP_ENV = appEnv
  jest.resetModules()

  return jest.requireActual<ConfigModule>('../app.config.ts').default
}

describe('app.config', () => {
  it('names the beta app and gives it the beta bundle id', () => {
    const config = loadConfig('beta')

    expect(config.name).toBe('Roundup Beta')
    expect(config.ios.bundleIdentifier).toBe('app.roundup.client.beta')
    expect(config.android.package).toBe('app.roundup.client.beta')
  })

  it('names the production app and gives it the production bundle id', () => {
    const config = loadConfig('prod')

    expect(config.name).toBe('Roundup')
    expect(config.ios.bundleIdentifier).toBe('app.roundup.client')
    expect(config.android.package).toBe('app.roundup.client')
  })

  it('turns on typed routes', () => {
    const config = loadConfig('beta')

    expect(config.experiments.typedRoutes).toBe(true)
  })
})
