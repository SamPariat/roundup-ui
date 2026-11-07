import type { ReactElement } from 'react'

import { Slot } from 'expo-router'
import { renderRouter, screen, waitFor } from 'expo-router/testing-library'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { CoreProvider } from '@roundup/core'
import { ThemeProvider } from '@roundup/ui'

import type { IBackend } from '../helpers/fakes'

import { Fakes } from '../helpers/fakes'
import WelcomeScreen from '@/app/index'
import { AuthStack } from '@/components/AuthStack'

/** Insets and frame of a phone, so the safe-area hooks have values. */
const METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
}

/** The refresh token a signed-in launch finds in the Keychain. */
let saved: string | undefined

/**
 * The root layout of the test app: the same stack as the real one, inside the providers it needs.
 * @returns The guarded stack.
 */
const Layout = (): ReactElement => (
  <SafeAreaProvider initialMetrics={METRICS}>
    <ThemeProvider>
      <CoreProvider deps={Fakes.testDeps(saved)}>
        <AuthStack />
      </CoreProvider>
    </ThemeProvider>
  </SafeAreaProvider>
)

/**
 * Stand-in for the tabs layout: renders the active tab.
 * @returns The slot.
 */
const TabsLayout = (): ReactElement => <Slot />

/**
 * Stand-in for the phone screen.
 * @returns A marker text.
 */
const Phone = (): ReactElement => <Text>screen: phone</Text>

/**
 * Stand-in for the name screen.
 * @returns A marker text.
 */
const Name = (): ReactElement => <Text>screen: name</Text>

/**
 * Stand-in for the code screen.
 * @returns A marker text.
 */
const Code = (): ReactElement => <Text>screen: code</Text>

/**
 * Stand-in for the signed-in app.
 * @returns A marker text.
 */
const Squads = (): ReactElement => <Text>screen: squads</Text>

/**
 * AuthStack test helpers. Static methods only.
 */
class AuthStackFixtures {
  /**
   * Renders the app at a url.
   * @param initialUrl - Where the app starts, as a deep link would.
   * @returns A promise that resolves once the app has rendered.
   */
  static async launch(initialUrl: string): Promise<void> {
    await renderRouter(
      {
        '(tabs)/_layout': TabsLayout,
        '(tabs)/squads': Squads,
        _layout: Layout,
        index: WelcomeScreen,
        'sign-in/code': Code,
        'sign-in/index': Phone,
        'sign-in/name': Name,
      },
      { initialUrl },
    )
  }
}

/** The backend the test talks to. */
let backend: IBackend

describe('AuthStack', () => {
  beforeEach(() => {
    saved = undefined
    backend = { paths: [], user: { name: 'Asha' } }
    Fakes.stubBackend(backend)
  })

  it('shows nothing while the saved session is being checked', async () => {
    saved = 'r1'
    backend.hang = true
    await AuthStackFixtures.launch('/')

    await waitFor(() => {
      expect(backend.paths).toContain('POST /api/v1/auth/refresh')
    })

    expect(screen.queryByText(/screen:/)).toBeNull()
  })

  it('shows Welcome when signed out', async () => {
    await AuthStackFixtures.launch('/')

    expect(await screen.findByText('Continue with phone')).toBeOnTheScreen()
  })

  it('sends a signed-out deep link to the app back to Welcome', async () => {
    await AuthStackFixtures.launch('/squads')

    expect(await screen.findByText('Continue with phone')).toBeOnTheScreen()
  })

  it('lets a signed-out visitor reach the sign-in screens', async () => {
    await AuthStackFixtures.launch('/sign-in')

    expect(await screen.findByText('screen: phone')).toBeOnTheScreen()
  })

  it('shows the app when signed in with a name', async () => {
    saved = 'r1'
    await AuthStackFixtures.launch('/')

    expect(await screen.findByText('screen: squads')).toBeOnTheScreen()
  })

  it('keeps a signed-in launch away from Welcome and sign-in', async () => {
    saved = 'r1'
    await AuthStackFixtures.launch('/sign-in')

    expect(await screen.findByText('screen: squads')).toBeOnTheScreen()
    expect(screen.queryByText('screen: phone')).toBeNull()
  })
})
