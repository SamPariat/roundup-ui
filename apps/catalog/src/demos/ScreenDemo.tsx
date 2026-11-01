import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Screen, Text, TopAppBar } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * Screen with and without a header, each in a fixed-height box. Screen fills its parent, so the
 * boxes stand in for the device. Safe-area insets are those of the real window.
 * @returns The specimens.
 */
export const ScreenDemo = (): ReactElement => (
  <>
    <Specimen note="The body pads all four edges." title="no header">
      <View className="h-64 overflow-hidden rounded-lg border border-border">
        <Screen className="items-center justify-center">
          <Text>The page content</Text>
        </Screen>
      </View>
    </Specimen>
    <Specimen
      note="The header handles the top inset itself, so the body skips it."
      title="header=<TopAppBar>"
    >
      <View className="h-64 overflow-hidden rounded-lg border border-border">
        <Screen header={<TopAppBar back title="Sign in" />}>
          <View className="flex-1 items-center justify-center">
            <Text>The page content</Text>
          </View>
        </Screen>
      </View>
    </Specimen>
  </>
)
