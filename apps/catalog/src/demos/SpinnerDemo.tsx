import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Spinner } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/** The four tones. */
const TONES = ['fg', 'accent', 'on-accent', 'fg-subtle'] as const

/**
 * Spinner in every tone. On-accent sits on an accent swatch, where it is used.
 * @returns The specimens.
 */
export const SpinnerDemo = (): ReactElement => (
  <Specimen
    note="Turns slower when the system asks apps to reduce motion. Hidden from screen readers: the control it sits in says it is busy."
    title="tone=…"
  >
    <View className="flex-row flex-wrap items-center gap-4">
      {TONES.map((tone) => (
        <View className={tone === 'on-accent' ? 'rounded-md bg-accent p-2' : 'p-2'} key={tone}>
          <Spinner tone={tone} />
        </View>
      ))}
    </View>
  </Specimen>
)
