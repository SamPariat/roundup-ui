import type { NativeStackHeaderProps } from 'expo-router'
import type { ReactElement } from 'react'

import { screen } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ThemeProvider } from '@roundup/ui'

import { TabHeader } from '@/components/TabHeader'

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

/**
 * A header action, as a screen's headerRight would draw one.
 * @returns Text standing in for a header button.
 */
const renderAction = (): ReactElement => <Text>Action</Text>

/**
 * TabHeader test helpers. Static methods only.
 */
class HeaderFixtures {
  /**
   * Renders the bar the stack would draw for one screen, at a width.
   * @param width - The window width.
   * @param routeName - The screen's route name inside its tab.
   * @param title - The title the stack layout gives it.
   * @param url - Where the router starts.
   * @returns The rendered router.
   */
  static renderAt(width: number, routeName: string, title: string, url: string) {
    mockWindow.width = width

    // Only the fields TabHeader reads; the rest of the stack's header props do not matter here.
    const props = {
      options: { headerRight: renderAction, title },
      route: { key: routeName, name: routeName },
    } as unknown as NativeStackHeaderProps

    /**
     * The screen whose bar is under test, inside the providers TabHeader needs.
     * @returns The bar on its own.
     */
    const Page = (): ReactElement => (
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 800, width, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <ThemeProvider>
          <TabHeader {...props} />
        </ThemeProvider>
      </SafeAreaProvider>
    )

    return renderRouter({ index: Page, 'profile/edit': Page }, { initialUrl: url })
  }
}

describe('TabHeader', () => {
  it.each([390, 1440])(
    'titles a tab screen from its options, with no back, at %i wide',
    async (width) => {
      await HeaderFixtures.renderAt(width, 'index', 'Your squads', '/')

      expect(screen.getByRole('heading', { name: 'Your squads' })).toBeOnTheScreen()
      expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen()
    },
  )

  it.each([390, 1440])('titles a pushed screen and offers back at %i wide', async (width) => {
    await HeaderFixtures.renderAt(width, 'edit', 'Edit profile', '/profile/edit')

    expect(screen.getByRole('heading', { name: 'Edit profile' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen()
  })

  it('puts the screen header actions in the bar', async () => {
    await HeaderFixtures.renderAt(390, 'index', 'Your squads', '/')

    expect(screen.getByText('Action')).toBeOnTheScreen()
  })
})
