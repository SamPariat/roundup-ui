import type { ReactElement } from 'react'

import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Screen } from '../../src/components/Screen.tsx'

// A notched phone held in landscape: every edge has its own inset.
const insets = { top: 47, right: 3, bottom: 34, left: 11 }
const frame = { x: 0, y: 0, width: 466, height: 800 }

/**
 * Wraps an element in a safe-area provider with the insets above.
 * @param ui - The element under test.
 * @returns The wrapped element.
 */
const inProvider = (ui: ReactElement) => (
  <SafeAreaProvider initialMetrics={{ insets, frame }}>{ui}</SafeAreaProvider>
)

/**
 * The view that pads the body: the host parent of the body text.
 * @returns The padded body view.
 */
const body = () => screen.getByText('Body').parent

describe('Screen', () => {
  it('keeps the body clear of every edge when there is no header', async () => {
    await render(
      inProvider(
        <Screen>
          <Text>Body</Text>
        </Screen>,
      ),
    )

    expect(body()).toHaveStyle({
      paddingTop: 47,
      paddingRight: 3,
      paddingBottom: 34,
      paddingLeft: 11,
    })
  })

  it('leaves the top to the header and renders it above the body', async () => {
    await render(
      inProvider(
        <Screen header={<Text>Header</Text>}>
          <Text>Body</Text>
        </Screen>,
      ),
    )

    expect(screen.getByText('Header')).toBeOnTheScreen()

    expect(body()).toHaveStyle({
      paddingTop: 0,
      paddingRight: 3,
      paddingBottom: 34,
      paddingLeft: 11,
    })
  })
})
