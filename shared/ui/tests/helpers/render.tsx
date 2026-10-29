import type { ReactElement } from 'react'
import type { EdgeInsets } from 'react-native-safe-area-context'

import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ThemeProvider } from '../../src/theme/theme.tsx'

const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 }

/** The device being simulated. */
interface RenderOptions {
  /** Safe-area insets of the device. Defaults to none. */
  insets?: EdgeInsets
  /** Window width in points. Defaults to 390, an iPhone. */
  width?: number
}

/**
 * Components read colours through useTheme() and safe areas through the provider, so every
 * test renders inside both. Pass insets and a frame width to test a particular device.
 * @param ui - The element under test.
 * @param options - The simulated device.
 * @returns The Testing Library render result.
 */
export const renderWithTheme = async (
  ui: ReactElement,
  options: RenderOptions = {},
): ReturnType<typeof render> => {
  const { insets = NO_INSETS, width = 390 } = options

  return render(
    <SafeAreaProvider initialMetrics={{ insets, frame: { x: 0, y: 0, width, height: 800 } }}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  )
}
