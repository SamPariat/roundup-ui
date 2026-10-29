import type { VariantProps } from 'class-variance-authority'
import type { ReactElement } from 'react'

import { cva } from 'class-variance-authority'
import { View } from 'react-native'

import { cn } from '../lib/cn.ts'
import { useReducedMotion } from '../lib/use-reduced-motion.ts'

const spinnerVariants = cva('size-4.5 rounded-full border-2 border-r-transparent', {
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

export type SpinnerProps = VariantProps<typeof spinnerVariants> & { className?: string }

// Decorative: the control that owns the spinner announces what it is doing.
// Under reduced motion it keeps turning, but slower.
export const Spinner = ({ className, tone }: SpinnerProps): ReactElement => {
  const reduced = useReducedMotion()

  return (
    <View
      aria-hidden
      className={cn(
        spinnerVariants({ tone }),
        reduced ? 'animate-spin-slow' : 'animate-spin',
        className,
      )}
      importantForAccessibility="no-hide-descendants"
    />
  )
}
