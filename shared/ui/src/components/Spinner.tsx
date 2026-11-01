import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'

import { cva } from 'class-variance-authority'
import { View } from 'react-native'

import { cn } from '../lib/cn.ts'
import { useReducedMotion } from '../lib/useReducedMotion.ts'

const spinnerVariants = cva('size-4.5 rounded-full border-2', {
  variants: {
    tone: {
      fg: 'border-fg',
      accent: 'border-accent',
      'on-accent': 'border-on-accent',
      'fg-subtle': 'border-fg-subtle',
    },
  },
  defaultVariants: { tone: 'fg' },
})

/** Props for Spinner: the tone variant plus extra classes. */
/** Props the spinner adds to its tone variant. */
interface SpinnerOwnProps {
  /** Extra classes for placement. */
  className?: string
}

/** Props for Spinner: the tone variant plus extra classes. */
export type SpinnerProps = SpinnerOwnProps & VariantProps<typeof spinnerVariants>

/**
 * Decorative: the control that owns the spinner announces what it is doing.
 * Under reduced motion it keeps turning, but slower.
 * @returns A round view that rotates.
 */
export const Spinner = ({ className, tone }: SpinnerProps): ReactElement => {
  const reduced = useReducedMotion()

  return (
    <View
      aria-hidden
      // The gap that shows the turn comes after the tone: tailwind-merge drops a border-r colour
      // that an all-sides border colour follows, which left a closed ring that looked still.
      className={cn(
        spinnerVariants({ tone }),
        'border-r-transparent',
        reduced ? 'animate-spin-slow' : 'animate-spin',
        className,
      )}
      importantForAccessibility="no-hide-descendants"
    />
  )
}
