import type { VariantProps } from 'class-variance-authority'
import type { ReactElement, ReactNode } from 'react'

import { cva } from 'class-variance-authority'
import { View } from 'react-native'

import { Text } from '../Text/Text.tsx'

const badgeVariants = cva('h-6 flex-row items-center gap-1 self-start rounded-full px-2', {
  variants: {
    tone: {
      neutral: 'bg-bg-hover',
      accent: 'bg-accent-soft',
      highlight: 'bg-highlight-soft',
      success: 'bg-success-soft',
      warning: 'bg-warning-soft',
      danger: 'bg-danger-soft',
      info: 'bg-info-soft',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

const dotVariants = cva('size-2 rounded-full', {
  variants: {
    tone: {
      neutral: 'bg-fg-muted',
      accent: 'bg-accent',
      highlight: 'bg-highlight',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  children?: ReactNode
  /** Hide the leading dot (plain tags such as venue types). */
  dot?: boolean
}

// The word carries the meaning; the dot colour only backs it up.
export const Badge = ({ children, dot = true, tone }: BadgeProps): ReactElement => (
  <View className={badgeVariants({ tone })}>
    {dot ? <View aria-hidden className={dotVariants({ tone })} /> : null}
    {/* Capped at 1.3x so a large system font does not break the pill. */}
    <Text maxFontSizeMultiplier={1.3} variant="caption">
      {children}
    </Text>
  </View>
)
