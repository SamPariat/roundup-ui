import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Badge } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** The seven tones. */
const TONES = ['neutral', 'accent', 'highlight', 'success', 'warning', 'danger', 'info'] as const

/**
 * Badge in every tone, with and without its dot.
 * @returns The specimens.
 */
export const BadgeDemo = (): ReactElement => (
  <>
    <Specimen title="tone=… · dot=true (default)">
      <View className="flex-row flex-wrap gap-3">
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </View>
    </Specimen>
    <Specimen note="For plain tags, such as a venue's categories." title="dot=false">
      <View className="flex-row flex-wrap gap-3">
        {TONES.map((tone) => (
          <Badge dot={false} key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </View>
    </Specimen>
  </>
)
