import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { Text } from '@roundup/ui'

/** Props for Specimen. */
export interface SpecimenProps {
  /** The component or state on show. */
  children: ReactNode
  /** One line on what to look for. */
  note?: string
  /** Names the variant, with the prop values (for example "variant=secondary · size=sm"). */
  title: string
}

/**
 * A labelled block of a demo: a heading, an optional note and the rendered component on a bordered stage.
 * @returns The block.
 */
export const Specimen = ({ children, note, title }: SpecimenProps): ReactElement => (
  <View className="gap-2" role="group">
    <Text heading={3} tone="muted" variant="label">
      {title}
    </Text>
    {note === undefined ? null : (
      <Text tone="subtle" variant="caption">
        {note}
      </Text>
    )}
    <View className="gap-3 rounded-xl border border-dashed border-border p-4">{children}</View>
  </View>
)
