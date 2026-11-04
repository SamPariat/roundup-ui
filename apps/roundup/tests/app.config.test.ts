import { existsSync } from 'node:fs'
import path from 'node:path'

import type defaultConfig from '../app.config'

/** The shape of the config object app.config.ts exports. */
type TAppConfig = typeof defaultConfig

/** The module app.config.ts compiles to. */
interface IConfigModule {
  /** The exported Expo config. */
  default: TAppConfig
}

/** The dark variant of the splash options. */
interface IDarkSplash {
  /** The background color. */
  backgroundColor: string
  /** The image path. */
  image: string
}

/** The options of the expo-splash-screen plugin entry. */
interface ISplashOptions {
  /** The light background. */
  backgroundColor: string
  /** The dark variant. */
  dark: IDarkSplash
  /** The light image. */
  image: string
}

/**
 * Config test helpers. Static methods only.
 */
class ConfigTestHelper {
  /**
   * Loads app.config.ts fresh with an APP_ENV, since the file reads it when it is first imported.
   * @param appEnv - The value of APP_ENV.
   * @returns The Expo config.
   */
  static loadConfig(appEnv: string): TAppConfig {
    process.env.APP_ENV = appEnv
    jest.resetModules()

    return jest.requireActual<IConfigModule>('../app.config').default
  }

  /**
   * Finds the splash plugin options.
   * @returns The options given to expo-splash-screen.
   */
  static splashOptions(): ISplashOptions {
    const entry = ConfigTestHelper.loadConfig('beta').plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    )

    return (entry as [string, ISplashOptions])[1]
  }
}

describe('app.config', () => {
  it('names the beta app and gives it the beta bundle id', () => {
    const config = ConfigTestHelper.loadConfig('beta')

    expect(config.name).toBe('Roundup Beta')
    expect(config.ios.bundleIdentifier).toBe('app.roundup.client.beta')
    expect(config.android.package).toBe('app.roundup.client.beta')
  })

  it('names the production app and gives it the production bundle id', () => {
    const config = ConfigTestHelper.loadConfig('prod')

    expect(config.name).toBe('Roundup')
    expect(config.ios.bundleIdentifier).toBe('app.roundup.client')
    expect(config.android.package).toBe('app.roundup.client')
  })

  it('turns on typed routes', () => {
    const config = ConfigTestHelper.loadConfig('beta')

    expect(config.experiments.typedRoutes).toBe(true)
  })
})

describe('app.config splash screen', () => {
  it('uses the Latte background with the light mark and Mocha with the dark mark', () => {
    const options = ConfigTestHelper.splashOptions()

    expect(options.backgroundColor).toBe('#f2e9e1')
    expect(options.dark.backgroundColor).toBe('#1e1e2e')
    expect(options.image).toContain('mark-light')
    expect(options.dark.image).toContain('mark-dark')
  })

  it('points at PNG files that exist', () => {
    const options = ConfigTestHelper.splashOptions()

    for (const image of [options.image, options.dark.image]) {
      expect(existsSync(path.resolve(__dirname, '..', image))).toBe(true)
    }
  })
})
