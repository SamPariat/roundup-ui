import type { ReactElement } from 'react'
import type { EdgeInsets } from 'react-native-safe-area-context'

import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ThemeProvider } from '../theme/theme.tsx'

const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 }

// Components read colours through useTheme() and safe areas through the provider, so every
// test renders inside both. Pass insets and a frame width to test a particular device.
export const renderWithTheme = async (
  ui: ReactElement,
  { insets = NO_INSETS, width = 390 }: { insets?: EdgeInsets; width?: number } = {},
): ReturnType<typeof render> =>
  render(
    <SafeAreaProvider initialMetrics={{ insets, frame: { x: 0, y: 0, width, height: 800 } }}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  )
