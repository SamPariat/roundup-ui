import type { ReactElement } from 'react'
import type { EdgeInsets } from 'react-native-safe-area-context'

import { View } from 'react-native'

import { Screen, Text, TopAppBar } from '@roundup/ui'

import { Preview } from '../components/Preview.tsx'
import { Specimen } from '../components/Specimen.tsx'

/**
 * A pretend status bar and home indicator, so the padding Screen adds shows the same on the web,
 * where the real window has no insets, as on a phone, where the real ones belong to the whole page.
 */
const DEMO_INSETS: EdgeInsets = { top: 24, right: 0, bottom: 16, left: 0 }

/**
 * Screen with and without a header, each in a fixed-height box. Screen fills its parent, so the
 * boxes stand in for the device, with the stand-in insets above.
 * @returns The specimens.
 */
export const ScreenDemo = (): ReactElement => (
  <>
    <Specimen
      note="The body pads all four edges. Shown with a 24 top and 16 bottom inset."
      title="no header"
    >
      <Preview className="h-64 border border-border" insets={DEMO_INSETS}>
        <Screen className="items-center justify-center">
          <Text>The page content</Text>
        </Screen>
      </Preview>
    </Specimen>
    <Specimen
      note="The header handles the top inset itself, so the body skips it."
      title="header=<TopAppBar>"
    >
      <Preview className="h-64 border border-border" insets={DEMO_INSETS}>
        <Screen header={<TopAppBar back title="Sign in" />}>
          <View className="flex-1 items-center justify-center">
            <Text>The page content</Text>
          </View>
        </Screen>
      </Preview>
    </Specimen>
  </>
)
