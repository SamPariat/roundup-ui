import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Icon, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { ICON_NAMES } from '../fixtures.ts'

/** The role colours an icon can take. */
const TONES = [
  'fg',
  'fg-muted',
  'fg-subtle',
  'accent',
  'highlight',
  'success',
  'warning',
  'danger',
  'info',
] as const

/** The grid sizes used in the app: inline text, controls, the bottom nav. */
const SIZES = [16, 20, 22, 32] as const

/**
 * Every icon of the set, then the sizes and tones of one.
 * @returns The specimens.
 */
export const IconDemo = (): ReactElement => (
  <>
    <Specimen
      note="Decorative here: in the app each one gets a label or sits next to text."
      title="name=…"
    >
      <View className="flex-row flex-wrap gap-4">
        {ICON_NAMES.map((name) => (
          <View className="w-24 items-center gap-2" key={name}>
            <Icon decorative name={name} size={24} />
            <Text tone="muted" variant="caption">
              {name}
            </Text>
          </View>
        ))}
      </View>
    </Specimen>
    <Specimen title="size=16 · 20 · 22 · 32">
      <View className="flex-row items-center gap-4">
        {SIZES.map((size) => (
          <Icon decorative key={size} name="star" size={size} />
        ))}
      </View>
    </Specimen>
    <Specimen title="tone=…">
      <View className="flex-row flex-wrap items-center gap-4">
        {TONES.map((tone) => (
          <View className="items-center gap-1" key={tone}>
            <Icon decorative name="star" size={24} tone={tone} />
            <Text tone="muted" variant="caption">
              {tone}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-row gap-4 rounded-lg bg-accent p-3">
        <Icon decorative name="check" tone="on-accent" />
        <Text tone="on-accent" variant="label">
          on-accent
        </Text>
      </View>
    </Specimen>
    <Specimen note="A labelled icon is announced as an image." title="label=Warning">
      <Icon label="Warning" name="alert" size={24} tone="warning" />
    </Specimen>
  </>
)
