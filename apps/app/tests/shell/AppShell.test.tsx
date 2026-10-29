import type { ReactElement } from 'react'

import { screen } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ThemeProvider } from '@roundup/ui'

import { AppShell } from '../../src/shell/AppShell.tsx'

const mockWindow = { width: 390, height: 800, scale: 2, fontScale: 1 }

/**
 * Stand-in for useWindowDimensions that returns the width a test chose. A function declaration so
 * the jest.mock factory can reach it before this file's constants are initialised.
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
interface Insets {
  /** Space taken by the status bar or notch. */
  top: number
  /** Space taken on the right edge, such as a hinge. */
  right: number
  /** Space taken by the gesture bar. */
  bottom: number
  /** Space taken on the left edge. */
  left: number
}

const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 }
const insets: Insets = { top: 47, right: 3, bottom: 34, left: 11 }

/**
 * Renders the shell inside a router at a given window width.
 * @param width - The window width in points.
 * @param current - Which tab is showing.
 * @param edgeInsets - The simulated safe-area insets.
 * @returns The router test renderer's result.
 */
const renderShellAt = (
  width: number,
  current: 'explore' | 'profile' | 'squads' = 'squads',
  edgeInsets: Insets = NO_INSETS,
) => {
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
        <AppShell current={current}>
          <Text>Page content</Text>
        </AppShell>
      </ThemeProvider>
    </SafeAreaProvider>
  )

  return renderRouter({ index: Page }, { initialUrl: '/' })
}

describe('AppShell', () => {
  it.each([360, 466, 626, 768, 890])('uses the bottom nav at %i wide', async (width) => {
    await renderShellAt(width)

    expect(screen.getByLabelText('Main')).toBeOnTheScreen()
    expect(screen.queryByLabelText('Sidebar')).not.toBeOnTheScreen()
    expect(screen.getByRole('heading', { name: 'Squads' })).toBeOnTheScreen()
  })

  it.each([1024, 1440])('uses the side nav at %i wide', async (width) => {
    await renderShellAt(width)

    expect(screen.getByLabelText('Sidebar')).toBeOnTheScreen()
    expect(screen.queryByLabelText('Main')).not.toBeOnTheScreen()
    expect(screen.getByRole('heading', { name: 'Squads' })).toBeOnTheScreen()
  })

  it('offers the same three destinations on every width', async () => {
    await renderShellAt(360)

    const phoneTabs = screen
      .getAllByRole('tab')
      .map((tab) => String(tab.props['accessibilityLabel']))

    expect(phoneTabs).toEqual(['Squads', 'Explore', 'Profile'])
  })

  it('selects the destination of the current route', async () => {
    await renderShellAt(1440, 'profile')

    expect(screen.getByRole('tab', { name: 'Profile' })).toBeSelected()
  })

  it('shows the page content', async () => {
    await renderShellAt(360)

    expect(screen.getByText('Page content')).toBeOnTheScreen()
  })

  it('reads each safe-area edge on its own', async () => {
    await renderShellAt(466, 'squads', insets)
    const bar = screen.getByLabelText('Main').parent

    expect(bar).toHaveStyle({
      paddingTop: 0,
      paddingRight: 3,
      paddingBottom: 34,
      paddingLeft: 11,
    })
  })
})
