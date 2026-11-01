import type { ReactElement } from 'react'

import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SafeArea, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** An edge of the screen. */
type Edge = 'bottom' | 'left' | 'right' | 'top'

/** The edge sets the specimens pad. */
const SETS: readonly (readonly Edge[])[] = [
  ['top', 'right', 'bottom', 'left'],
  ['top'],
  ['bottom'],
  ['left', 'right'],
]

/**
 * SafeArea with different edge sets. The insets of the window are listed first; on the web they are
 * all zero, and on a phone with a notch or a gesture bar the padding shows.
 * @returns The specimens.
 */
export const SafeAreaDemo = (): ReactElement => {
  const insets = useSafeAreaInsets()

  return (
    <>
      <Specimen
        note="Each edge reads its own inset, so a notch on one side never moves the others."
        title="Insets of this window"
      >
        <Text variant="numeric">
          {`top ${String(insets.top)} · right ${String(insets.right)} · bottom ${String(insets.bottom)} · left ${String(insets.left)}`}
        </Text>
      </Specimen>
      {SETS.map((edges) => (
        <Specimen key={edges.join('-')} title={`edges=${edges.join(', ')}`}>
          <View className="rounded-lg bg-border">
            <SafeArea className="bg-accent-soft" edges={edges}>
              <View className="h-16 items-center justify-center bg-bg-raised">
                <Text variant="caption">Content</Text>
              </View>
            </SafeArea>
          </View>
        </Specimen>
      ))}
    </>
  )
}
