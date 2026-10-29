import type { ReactElement } from 'react'

import { render, screen } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { SafeArea } from '../../src/components/SafeArea.tsx'

// The Duo's hinge side and the gesture bar give each edge a different inset.
const insets = { top: 47, right: 3, bottom: 34, left: 11 }
const frame = { x: 0, y: 0, width: 466, height: 800 }

const inProvider = (ui: ReactElement) => (
  <SafeAreaProvider initialMetrics={{ insets, frame }}>{ui}</SafeAreaProvider>
)

describe('SafeArea', () => {
  it('applies each requested edge from its own inset', async () => {
    await render(
      inProvider(
        <SafeArea
          accessibilityLabel="area"
          accessible
          edges={['top', 'left', 'right', 'bottom']}
        />,
      ),
    )

    expect(screen.getByLabelText('area')).toHaveStyle({
      paddingTop: 47,
      paddingRight: 3,
      paddingBottom: 34,
      paddingLeft: 11,
    })
  })

  it('leaves edges that were not requested at zero', async () => {
    await render(inProvider(<SafeArea accessibilityLabel="area" accessible edges={['bottom']} />))

    expect(screen.getByLabelText('area')).toHaveStyle({
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 34,
      paddingLeft: 0,
    })
  })
})
