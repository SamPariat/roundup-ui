import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'
import type { TextProps as NativeTextProps } from 'react-native'

import { cva } from 'class-variance-authority'
import { Text as NativeText } from 'react-native'

import { cn } from '../lib/cn.ts'

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
export type TextProps = NativeTextProps &
  VariantProps<typeof textVariants> & {
    /** Marks the text as a heading for screen readers (1 is the page title). */
    heading?: 1 | 2 | 3
  }

/**
 * Text in one of the design-system type styles and a role colour. Every visible string goes through it so type and colour stay on the scale.
 * @returns The styled text.
 */
export const Text = ({ className, heading, tone, variant, ...props }: TextProps): ReactElement => (
  <NativeText
    aria-level={heading}
    className={cn(textVariants({ tone, variant }), className)}
    role={heading === undefined ? undefined : 'heading'}
    {...props}
  />
)
