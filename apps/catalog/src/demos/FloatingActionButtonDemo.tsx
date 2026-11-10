import type { ReactElement } from 'react'

import { View } from 'react-native'

import { FloatingActionButton, Text } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * FloatingActionButton in the corner of a stand-in screen, over its content.
 * @returns The specimens.
 */
export const FloatingActionButtonDemo = (): ReactElement => (
  <Specimen
    note="It floats over the bottom-right of its parent; the content scrolls beneath it."
    title="icon=plus"
  >
    <View className="h-48 rounded-xl bg-bg-sunken p-4">
      <View className="flex-1">
        <Text tone="muted">Screen content</Text>
        <FloatingActionButton icon="plus">New squad</FloatingActionButton>
      </View>
    </View>
  </Specimen>
)
