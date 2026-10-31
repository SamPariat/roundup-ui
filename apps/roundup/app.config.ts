import type { ConfigContext, ExpoConfig } from 'expo/config'

import { existsSync } from 'node:fs'
import path from 'node:path'

/** The two deployment environments, named like the backend's. */
export type AppEnv = 'beta' | 'prod'

const APP_ENVS: readonly AppEnv[] = ['beta', 'prod']

/**
 * Validates the APP_ENV value, so a typo fails the build with the fix in the message instead of shipping the wrong app.
 * @param value - The raw APP_ENV text, if any.
 * @returns The environment.
 */
export const parseAppEnv = (value: string | undefined): AppEnv => {
  const match = APP_ENVS.find((env) => env === value)

  if (match === undefined) {
    const got = value === undefined ? 'nothing' : `"${value}"`

    throw new Error(`APP_ENV must be "beta" or "prod", got ${got}. Run: make web APP_ENV=beta`)
  }

  return match
}

/**
 * Builds the Expo config for the chosen environment: loads the matching .env file, names the app and its bundle IDs, and turns on typed routes and the React Compiler.
 * @param context - Expo's config context: the base config and the project root.
 * @returns The Expo config.
 */
const createConfig = (context: ConfigContext): ExpoConfig => {
  const { config, projectRoot } = context
  const appEnv = parseAppEnv(process.env.APP_ENV)

  // Expo only reads .env, .env.local and .env.<mode>. Roundup's backend names its files
  // .env.beta and .env.prod, so the matching one is loaded here. Variables already set win,
  // which is how Docker build args and CI override it.
  const envFile = path.join(projectRoot, `.env.${appEnv}`)

  if (existsSync(envFile)) process.loadEnvFile(envFile)

  return {
    ...config,
    name: appEnv === 'prod' ? 'Roundup' : 'Roundup Beta',
    slug: 'roundup',
    scheme: 'roundup',
    version: '0.1.0',
    orientation: 'default',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: appEnv === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
    },
    android: {
      package: appEnv === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
    },
    web: { bundler: 'metro', output: 'static' },
    plugins: [
      ['expo-router', { root: './src/app' }],
      'expo-font',
      'expo-localization',
      'expo-splash-screen',
      'expo-system-ui',
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: { appEnv },
  }
}

export default createConfig
