import type { ComponentType, ReactElement } from 'react'

import { Slot } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { CoreProvider } from '@roundup/core'
import { ThemeProvider } from '@roundup/ui'

import type { FakeNetwork, IBackend } from './fakes'

import { AuthStack } from '../../src/components/AuthStack'
import { OfflineNotice } from '../../src/components/OfflineNotice'
import { Fakes } from './fakes'

/** Insets and frame of a phone, so the safe-area hooks have values. */
const METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
}

/** Where a test app starts, and what its backend does. */
export interface IAppOptions {
  /** The url the app opens at, as a deep link would. */
  url: string
  /** The refresh token the Keychain holds; none means a signed-out launch. */
  saved?: string
  /** What the stubbed backend answers. */
  backend: IBackend
  /** True to render the real AuthStack guards instead of a plain slot. */
  guarded?: boolean
  /** The network source; a test calls set(false) on it to go offline. Defaults to one that stays online. */
  network?: FakeNetwork
}

/**
 * Rendering helpers for the app tests. Static methods only.
 */
export class Render {
  /**
   * Renders routes inside the providers and the offline notice the real root layout supplies, against a stubbed backend.
   * @param routes - The route files, by their path under src/app.
   * @param options - The start url, the saved session and the backend.
   * @returns A promise that resolves once the app has rendered.
   */
  static async app(routes: Record<string, ComponentType>, options: IAppOptions): Promise<void> {
    const { backend, guarded = false, network, saved, url } = options

    Fakes.stubBackend(backend)

    const deps = Fakes.testDeps(saved, network)

    /**
     * The root layout of the test app.
     * @returns The providers around the current route.
     */
    const Layout = (): ReactElement => (
      <SafeAreaProvider initialMetrics={METRICS}>
        <ThemeProvider>
          <CoreProvider deps={deps}>
            {guarded ? <AuthStack /> : <Slot />}
            <OfflineNotice />
          </CoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    )

    await renderRouter({ ...routes, _layout: Layout }, { initialUrl: url })
  }
}
