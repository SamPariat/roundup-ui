import type { ReactElement, ReactNode } from 'react'

import { Platform, View } from 'react-native'

import { cn, Text } from '@roundup/ui'

// Tailwind sets border-style through --tw-border-style, which the web keeps to the element that
// declares it. react-native-css lets it inherit, so on iOS and Android a dashed box would turn
// every bordered component inside it (a TextField, a Chip) dashed too. Native draws it solid.
const DASHED = Platform.OS === 'web' ? 'border-dashed' : ''

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
    <View className={cn('gap-3 rounded-xl border border-border p-4', DASHED)}>{children}</View>
  </View>
)
