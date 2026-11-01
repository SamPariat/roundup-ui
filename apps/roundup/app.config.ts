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
  // The light icon is the fallback wherever no themed variant applies. The PNGs come from
  // assets/svg/app-icon through scripts/make-icons.sh (make icons) and are committed.
  icon: './assets/icon/icon-light.png',
  android: {
    package: process.env.APP_ENV === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
    // The mark on the Latte background. Android 13+ recolours the monochrome layer when the
    // person turns on themed icons.
    adaptiveIcon: {
      foregroundImage: './assets/icon/adaptive-foreground.png',
      monochromeImage: './assets/icon/adaptive-monochrome.png',
      backgroundColor: '#f2e9e1',
    },
  },
  ios: {
    supportsTablet: true,
    // iOS 18+ follows the home screen appearance: Latte when light, the Mocha mark on the system's
    // dark backdrop when dark, and a greyscale mark the system tints when tinted.
    icon: {
      light: './assets/icon/icon-light.png',
      dark: './assets/icon/icon-dark.png',
      tinted: './assets/icon/icon-tinted.png',
    },
    bundleIdentifier:
      process.env.APP_ENV === 'prod' ? 'app.roundup.client' : 'app.roundup.client.beta',
  },
  web: { bundler: 'metro', output: 'static' },
  plugins: [
    ['expo-router', { root: './src/app' }],
    [
      'expo-font',
      {
        // Onest, embedded in the native build so text never waits on a download. Files are named
        // after their PostScript names, the family name iOS and Android both use (see theme.css).
        fonts: [
          '../../assets/fonts/Onest-Regular.ttf',
          '../../assets/fonts/Onest-Medium.ttf',
          '../../assets/fonts/Onest-SemiBold.ttf',
          '../../assets/fonts/Onest-Bold.ttf',
        ],
      },
    ],
    'expo-localization',
    [
      'expo-splash-screen',
      {
        // The system appearance picks the pair: Latte (the warm light theme) by default and Mocha
        // when the device is dark, the same split the app's theme.css makes. The PNGs come from
        // assets/svg/logo/mark-*.svg through scripts/make-splash.sh.
        image: './assets/splash/mark-light.png',
        imageWidth: 96,
        backgroundColor: '#f2e9e1',
        dark: { image: './assets/splash/mark-dark.png', backgroundColor: '#1e1e2e' },
      },
    ],
    'expo-system-ui',
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: { appEnv: process.env.APP_ENV },
} satisfies ExpoConfig
