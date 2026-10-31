import type { ExpoConfig } from 'expo/config'

// APP_ENV is beta or prod, like the backend's. scripts/with-env.sh loads apps/roundup/.env.<APP_ENV>
// before Expo starts, so this file only describes the app and reads the environment it is given.
export default {
  name: process.env.APP_ENV === 'prod' ? 'Roundup' : 'Roundup Beta',
  slug: 'roundup',
  scheme: 'roundup',
  version: '0.1.0',
  orientation: 'default',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier:
      process.env.APP_ENV === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
  },
  android: {
    package: process.env.APP_ENV === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
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
  extra: { appEnv: process.env.APP_ENV },
} satisfies ExpoConfig
