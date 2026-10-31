import type { ReactElement } from 'react'

import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
  useFonts,
} from '@expo-google-fonts/onest'
import { Stack } from 'expo-router'
import Head from 'expo-router/head'
import { preventAutoHideAsync } from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '../../global.css'

import { ThemeProvider, useRoleColor, useTheme } from '@roundup/ui'

import { useSplash } from '../hooks/useSplash.ts'

void preventAutoHideAsync()

/** Props for Themed. */
interface ThemedProps {
  /** Whether the fonts are loaded (or failed to), which the splash screen also waits for. */
  fontsReady: boolean
}

/**
 * The part of the root layout that needs the theme: page background, status bar style and the stack.
 * It also lifts the splash screen once the fonts and the saved theme are both ready.
 * @returns The themed root view.
 */
const Themed = ({ fontsReady }: ThemedProps): ReactElement => {
  const { loaded, name } = useTheme()
  const background = useRoleColor('bg')

  useSplash(fontsReady && loaded)

  return (
    <View className="flex-1 bg-bg">
      {/* Web only: the static export's own document already sets lang="en". */}
      <Head>
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <meta content="dark light" name="color-scheme" />
      </Head>
      <StatusBar style={name === 'mocha' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}
      />
    </View>
  )
}

/**
 * The root layout. On native the splash screen stays up until the fonts and the saved theme are ready; on web it renders at once so the static export has content, and the splash drawn by +html.tsx is lifted at the same point.
 * @returns The providers around the stack, or null while fonts load on native.
 */
export default function RootLayout(): null | ReactElement {
  const [loaded, error] = useFonts({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
  })

  const ready = loaded || error !== null

  // Native waits for the fonts behind the splash screen. Web renders at once so the static
  // export has real content, and the fonts swap in when they arrive.
  if (!ready && Platform.OS !== 'web') return null

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Themed fontsReady={ready} />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
