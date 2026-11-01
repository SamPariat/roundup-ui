import type config from '../app.config.ts'

/** The shape of the config object app.config.ts exports. */
type AppConfig = typeof config

/** The module app.config.ts compiles to. */
interface ConfigModule {
  /** The exported Expo config. */
  default: AppConfig
}

const { default: appConfig } = jest.requireActual<ConfigModule>('../app.config.ts')

describe('app.config', () => {
  it('installs next to Roundup Beta instead of replacing it', () => {
    expect(appConfig.name).toBe('Roundup Catalog')
    expect(appConfig.ios.bundleIdentifier).toBe('app.roundup.catalog')
    expect(appConfig.android.package).toBe('app.roundup.catalog')
    expect(appConfig.scheme).toBe('roundup-catalog')
  })

  it('exports a static web site', () => {
    expect(appConfig.web.output).toBe('static')
  })

  it('turns on typed routes and the React Compiler', () => {
    expect(appConfig.experiments).toEqual({ typedRoutes: true, reactCompiler: true })
  })
})
