import type { ReactElement } from 'react'

import { View } from 'react-native'

import { cn } from '../lib/cn.ts'
import { useReducedMotion } from '../lib/use-reduced-motion.ts'

export interface SkeletonProps {
  variant?: 'card' | 'row'
  count?: number
}

const Block = ({ className }: { className: string }): ReactElement => {
  const reduced = useReducedMotion()

  return (
    <View
      className={cn(
        'rounded-sm bg-bg-sunken',
        reduced ? 'animate-none' : 'animate-pulse',
        className,
      )}
    />
  )
}

// Loading is shape-first. The group is one busy region named "Loading"; the shapes are decoration.
export const Skeleton = ({ count = 1, variant = 'row' }: SkeletonProps): ReactElement => {
  if (variant === 'card') {
    return (
      <View
        accessibilityLabel="Loading"
        accessible
        aria-busy
        className="overflow-hidden rounded-lg border border-border bg-bg-raised"
      >
        <Block className="h-[160px] w-full rounded-none" />
        <View className="gap-1 px-4 pt-3 pb-4">
          <Block className="h-[20px] w-[60%]" />
          <Block className="h-[14px] w-[40%]" />
          <Block className="h-[14px] w-[30%]" />
        </View>
      </View>
    )
  }

  return (
    <View accessibilityLabel="Loading" accessible aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <View className="flex-row items-center gap-3 px-4 py-3" key={index}>
          <Block className="size-[40px] rounded-full" />
          <View className="flex-1 gap-2">
            <Block className={index % 2 === 0 ? 'h-[14px] w-[60%]' : 'h-[14px] w-[45%]'} />
            <Block className={index % 2 === 0 ? 'h-3 w-[40%]' : 'h-3 w-[30%]'} />
          </View>
        </View>
      ))}
    </View>
  )
}
