import type { ComponentType, ReactElement } from 'react'

import { Slot } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { CoreProvider } from '@roundup/core'
import { ThemeProvider } from '@roundup/ui'

import type { Backend } from './fakes.ts'

import { stubBackend, testDeps } from './fakes.ts'

/** Insets and frame of a phone, so the safe-area hooks have values. */
const METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
}

/** Where a test app starts, and what its backend does. */
export interface AppOptions {
  /** The url the app opens at, as a deep link would. */
  url: string
  /** The refresh token the Keychain holds; none means a signed-out launch. */
  saved?: string
  /** What the stubbed backend answers. */
  backend: Backend
}

/**
 * Renders routes inside the providers the real root layout supplies, against a stubbed backend.
 * @param routes - The route files, by their path under src/app.
 * @param options - The start url, the saved session and the backend.
 * @returns A promise that resolves once the app has rendered.
 */
export const renderApp = async (
  routes: Record<string, ComponentType>,
  options: AppOptions,
): Promise<void> => {
  const { backend, saved, url } = options

  stubBackend(backend)

  const deps = testDeps(saved)

  /**
   * The root layout of the test app.
   * @returns The providers around the current route.
   */
  const Layout = (): ReactElement => (
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider>
        <CoreProvider deps={deps}>
          <Slot />
        </CoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )

  await renderRouter({ ...routes, _layout: Layout }, { initialUrl: url })
}
