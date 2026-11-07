import type { ReactElement } from 'react'

import { useFonts } from 'expo-font'
import Head from 'expo-router/head'
import { preventAutoHideAsync } from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '../../global.css'

import { CoreProvider } from '@roundup/core'
import { ThemeProvider, useSplash, useTheme } from '@roundup/ui'

import OnestBold from '../../../../assets/fonts/Onest-Bold.ttf'
import OnestMedium from '../../../../assets/fonts/Onest-Medium.ttf'
import OnestRegular from '../../../../assets/fonts/Onest-Regular.ttf'
import OnestSemiBold from '../../../../assets/fonts/Onest-SemiBold.ttf'
import { AuthStack } from '@/components/AuthStack'
import { OfflineNotice } from '@/components/OfflineNotice'
import { useRouteGate } from '@/hooks/useRouteGate'

void preventAutoHideAsync()

// iOS and Android get Onest from the expo-font plugin in app.config.ts, built into the binary. The
// web has no binary, so it registers the same files under the same names at runtime.
const FONTS = Platform.select({
  default: {},
  web: {
    'Onest-Bold': OnestBold,
    'Onest-Medium': OnestMedium,
    'Onest-Regular': OnestRegular,
    'Onest-SemiBold': OnestSemiBold,
  },
})

/** Props for Themed. */
interface IThemedProps {
  /** Whether the fonts are loaded (or failed to), which the splash screen also waits for. */
  fontsReady: boolean
}

/**
 * The part of the root layout that needs the theme: page background, status bar style and the stack.
 * It also lifts the splash screen once the fonts, the saved theme and the saved session are all ready.
 * @returns The themed root view.
 */
const Themed = ({ fontsReady }: IThemedProps): ReactElement => {
  const { loaded, name } = useTheme()
  const gate = useRouteGate()

  useSplash(fontsReady && loaded && gate !== 'loading')

  return (
    <View className="flex-1 bg-bg">
      {/* Web only: the favicon and color-scheme hint mean nothing on native, where expo-router's
          Head turns into Apple Handoff and demands a hosted origin we do not have yet. The static
          export's own document already sets lang="en". */}
      {Platform.OS === 'web' && (
        <Head>
          <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          <meta content="dark light" name="color-scheme" />
        </Head>
      )}
      <StatusBar style={name === 'mocha' ? 'light' : 'dark'} />
      <AuthStack />
      <OfflineNotice />
    </View>
  )
}

/**
 * The root layout. On native the splash screen stays up until the fonts, the saved theme and the saved session are ready; on web it renders at once so the static export has content, and the splash drawn by +html.tsx is lifted at the same point.
 * @returns The providers around the stack, or null while fonts load on native.
 */
export default function RootLayout(): null | ReactElement {
  const [loaded, error] = useFonts(FONTS)

  const ready = loaded || error !== null

  // Native waits for the fonts behind the splash screen. Web renders at once so the static
  // export has real content, and the fonts swap in when they arrive.
  if (!ready && Platform.OS !== 'web') return null

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CoreProvider>
          <Themed fontsReady={ready} />
        </CoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
