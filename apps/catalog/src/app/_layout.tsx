import type { ReactElement } from 'react'

import { useFonts } from 'expo-font'
import { Stack, useGlobalSearchParams } from 'expo-router'
import Head from 'expo-router/head'
import { preventAutoHideAsync } from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '../../global.css'

import { cn, ThemeProvider, useRoleColor, useTheme } from '@roundup/ui'

import OnestBold from '../../../../assets/fonts/Onest-Bold.ttf'
import OnestMedium from '../../../../assets/fonts/Onest-Medium.ttf'
import OnestRegular from '../../../../assets/fonts/Onest-Regular.ttf'
import OnestSemiBold from '../../../../assets/fonts/Onest-SemiBold.ttf'
import { ComponentNav } from '../components/ComponentNav.tsx'
import { FrameProvider } from '../components/FrameProvider.tsx'
import { useSplash } from '../hooks/useSplash.ts'
import { useWide } from '../hooks/useWide.ts'

void preventAutoHideAsync()

// iOS and Android get Onest from the expo-font plugin in app.config.ts, built into the binary. The
// web has no binary, so it registers the same files under the same names at runtime.
const FONTS =
  Platform.OS === 'web'
    ? {
        'Onest-Bold': OnestBold,
        'Onest-Medium': OnestMedium,
        'Onest-Regular': OnestRegular,
        'Onest-SemiBold': OnestSemiBold,
      }
    : {}

/** Props for Themed. */
interface ThemedProps {
  /** Whether the fonts are loaded (or failed to), which the splash screen also waits for. */
  fontsReady: boolean
}

/**
 * The part of the root layout that needs the theme: page background, status bar style, the list of
 * components beside the page from 1024 wide, and the stack. It also lifts the splash screen once
 * the fonts and the saved theme are both ready.
 * @returns The themed root view.
 */
const Themed = ({ fontsReady }: ThemedProps): ReactElement => {
  const { loaded, name } = useTheme()
  const background = useRoleColor('bg')
  const wide = useWide()
  const { component } = useGlobalSearchParams()

  useSplash(fontsReady && loaded)

  return (
    <View className={cn('flex-1 bg-bg', wide && 'flex-row')}>
      {/* Web only: the colour-scheme hint means nothing on native, where expo-router's Head turns
          into Apple Handoff and demands a hosted origin we do not have. */}
      {Platform.OS === 'web' && (
        <Head>
          <meta content="dark light" name="color-scheme" />
        </Head>
      )}
      <StatusBar style={name === 'mocha' ? 'light' : 'dark'} />
      {wide ? (
        <ComponentNav current={typeof component === 'string' ? component : undefined} />
      ) : null}
      <View className="min-w-0 flex-1">
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}
        />
      </View>
    </View>
  )
}

/**
 * The root layout. On native the splash screen stays up until the fonts and the saved theme are ready; on web it renders at once so the static export has content, and the splash drawn by +html.tsx is lifted at the same point.
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
        <FrameProvider>
          <Themed fontsReady={ready} />
        </FrameProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
