import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'
import type { TextProps as NativeTextProps } from 'react-native'

import { cva } from 'class-variance-authority'
import { Text as NativeText } from 'react-native'

import { cn } from '../lib/cn'

/**
 * How far the device's text size may enlarge any text: 1.3 times, which is where the larger
 * accessibility sizes stop fitting the layouts. Below it the text still follows the setting, so
 * Dynamic Type and Android's font scale keep working; a Text can pass its own, tighter limit.
 */
const FONT_SCALE_LIMIT = 1.3

const textVariants = cva('', {
  variants: {
    variant: {
      display: 'type-display',
      title: 'type-title',
      heading: 'type-heading',
      body: 'type-body',
      'body-strong': 'type-body-strong',
      'body-sm': 'type-body-sm',
      label: 'type-label',
      caption: 'type-caption',
      otp: 'type-otp',
      numeric: 'type-numeric',
    },
    tone: {
      fg: 'text-fg',
      muted: 'text-fg-muted',
      subtle: 'text-fg-subtle',
      accent: 'text-accent',
      danger: 'text-danger',
      'on-accent': 'text-on-accent',
      'on-highlight': 'text-on-highlight',
    },
  },
  defaultVariants: { variant: 'body', tone: 'fg' },
})

/** Props for Text: native text props plus the type style and tone variants. */
export type TTextProps = NativeTextProps &
  VariantProps<typeof textVariants> & {
    /** Marks the text as a heading for screen readers (1 is the page title). */
    heading?: 1 | 2 | 3
  }

/**
 * Text in one of the design-system type styles and a role color. Every visible string goes through it so type and color stay on the scale, and the device's text size cannot enlarge it past 1.3 times.
 * @returns The styled text.
 */
export const Text = ({ className, heading, tone, variant, ...props }: TTextProps): ReactElement => (
  <NativeText
    aria-level={heading}
    className={cn(textVariants({ tone, variant }), className)}
    maxFontSizeMultiplier={FONT_SCALE_LIMIT}
    role={heading === undefined ? undefined : 'heading'}
    {...props}
  />
)
