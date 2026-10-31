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
import { hideAsync, preventAutoHideAsync } from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '../../global.css'

import { ThemeProvider, useRoleColor, useTheme } from '@roundup/ui'

void preventAutoHideAsync()

/**
 * The part of the root layout that needs the theme: page background, status bar style and the stack.
 * @returns The themed root view.
 */
const Themed = (): ReactElement => {
  const { name } = useTheme()
  const background = useRoleColor('bg')

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
 * The root layout. On native it holds the splash screen until the fonts are ready; on web it renders at once so the static export has content.
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

  useEffect(() => {
    if (ready) void hideAsync()
  }, [ready])

  // Native waits for the fonts behind the splash screen. Web renders at once so the static
  // export has real content, and the fonts swap in when they arrive.
  if (!ready && Platform.OS !== 'web') return null

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Themed />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
