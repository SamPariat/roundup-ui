import type { ReactElement } from 'react'

import { screen } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { CoreProvider } from '@roundup/core'
import { ThemeProvider } from '@roundup/ui'

import { Fakes } from '../helpers/fakes'
import { AppShell } from '@/components/AppShell'

const mockWindow = { width: 390, height: 800, scale: 2, fontScale: 1 }

/**
 * Stand-in for useWindowDimensions that returns the width a test chose. A function declaration so
 * the jest.mock factory can reach it before this file's constants are initialized.
 * @returns The mocked window.
 */
function mockUseWindowDimensions(): typeof mockWindow {
  return mockWindow
}

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: mockUseWindowDimensions,
}))

/** Safe-area insets of the simulated device. */
interface IInsets {
  /** Space taken by the status bar or notch. */
  top: number
  /** Space taken on the right edge, such as a hinge. */
  right: number
  /** Space taken by the gesture bar. */
  bottom: number
  /** Space taken on the left edge. */
  left: number
}

const NO_INSETS: IInsets = { top: 0, right: 0, bottom: 0, left: 0 }
const insets: IInsets = { top: 47, right: 3, bottom: 34, left: 11 }

/**
 * Shell test helpers. Static methods only.
 */
class ShellFixtures {
  /**
   * Renders the shell inside a router at a given window width.
   * @param width - The window width in points.
   * @param current - Which tab is showing.
   * @param edgeInsets - The simulated safe-area insets.
   * @param url - The route the app opens at.
   * @param deps - The test dependencies; signed out unless a saved session is given.
   * @returns The router test renderer's result.
   */
  static renderShellAt(
    width: number,
    current: 'explore' | 'profile' | 'squads' = 'squads',
    edgeInsets: IInsets = NO_INSETS,
    url = '/',
    deps = Fakes.testDeps(),
  ) {
    mockWindow.width = width

    /**
     * The route component that wraps the shell in the providers it needs.
     * @returns The shell around a line of page content.
     */
    const Page = (): ReactElement => (
      <SafeAreaProvider
        initialMetrics={{ insets: edgeInsets, frame: { x: 0, y: 0, width, height: 800 } }}
      >
        <ThemeProvider>
          <CoreProvider deps={deps}>
            <AppShell current={current}>
              <Text>Page content</Text>
            </AppShell>
          </CoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    )

    return renderRouter({ index: Page, 'profile/edit': Page }, { initialUrl: url })
  }
}

describe('AppShell', () => {
  it.each([360, 466, 626, 768, 890])('uses the bottom nav at %i wide', async (width) => {
    await ShellFixtures.renderShellAt(width)

    expect(screen.getByLabelText('Main')).toBeOnTheScreen()
    expect(screen.queryByLabelText('Sidebar')).not.toBeOnTheScreen()
  })

  it.each([1024, 1440])('uses the side nav at %i wide', async (width) => {
    await ShellFixtures.renderShellAt(width)

    expect(screen.getByLabelText('Sidebar')).toBeOnTheScreen()
    expect(screen.queryByLabelText('Main')).not.toBeOnTheScreen()
  })

  it('offers the same three destinations on every width', async () => {
    await ShellFixtures.renderShellAt(360)

    const phoneTabs = screen
      .getAllByRole('tab')
      .map((tab) => String(tab.props['accessibilityLabel']))

    expect(phoneTabs).toEqual(['Squads', 'Explore', 'Profile'])
  })

  it('selects the destination of the current route', async () => {
    await ShellFixtures.renderShellAt(1440, 'profile')

    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected()
  })

  it('shows the signed-in person at the foot of the side nav', async () => {
    Fakes.stubBackend({ paths: [], user: { name: 'Asha Rao' } })
    await ShellFixtures.renderShellAt(1440, 'squads', NO_INSETS, '/', Fakes.testDeps('r1'))

    expect(await screen.findByText('Asha Rao')).toBeOnTheScreen()
    expect(screen.getByText('+91 98765 43210')).toBeOnTheScreen()
  })

  it('shows the page content', async () => {
    await ShellFixtures.renderShellAt(360)

    expect(screen.getByText('Page content')).toBeOnTheScreen()
  })

  it('reads each safe-area edge on its own', async () => {
    await ShellFixtures.renderShellAt(466, 'squads', insets)
    const bar = screen.getByLabelText('Main').parent

    expect(bar).toHaveStyle({
      paddingTop: 0,
      paddingRight: 3,
      paddingBottom: 34,
      paddingLeft: 11,
    })
  })
})
