import type { ConfigContext, ExpoConfig } from 'expo/config'

import { existsSync } from 'node:fs'
import path from 'node:path'

export type AppEnv = 'beta' | 'prod'

const APP_ENVS: readonly AppEnv[] = ['beta', 'prod']

export const parseAppEnv = (value: string | undefined): AppEnv => {
  const match = APP_ENVS.find((env) => env === value)
  if (match === undefined) {
    throw new Error(
      `APP_ENV must be "beta" or "prod", got ${value === undefined ? 'nothing' : `"${value}"`}. Run: make web APP_ENV=beta`,
    )
  }
  return match
}

const createConfig = ({ config, projectRoot }: ConfigContext): ExpoConfig => {
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
      'expo-splash-screen',
      'expo-system-ui',
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: { appEnv },
  }
}

export default createConfig
