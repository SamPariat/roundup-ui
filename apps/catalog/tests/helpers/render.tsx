import type { ReactElement } from 'react'

import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ThemeProvider } from '@roundup/ui'

import { FrameProvider } from '@/components/FrameProvider'

/**
 * Rendering helpers for the catalog tests. Static methods only.
 */
export class Render {
  /**
   * Renders an element inside the providers the catalog's root layout supplies: safe areas, the
   * theme and the preview width.
   * @param ui - The element under test.
   * @returns The Testing Library render result.
   */
  static async inCatalog(ui: ReactElement): ReturnType<typeof render> {
    return render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
          frame: { x: 0, y: 0, width: 390, height: 800 },
        }}
      >
        <ThemeProvider>
          <FrameProvider>{ui}</FrameProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    )
  }
}
