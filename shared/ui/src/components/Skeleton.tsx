import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { ClassHelper } from '../lib/class-helper'
import { useReducedMotion } from '../lib/useReducedMotion'

/** Props for Skeleton. */
export interface ISkeletonProps {
  /** Which placeholder shape: a list `row` or a venue `card`. Defaults to row. */
  variant?: 'card' | 'row'
  /** How many rows to draw. Ignored for cards. Defaults to 1. */
  count?: number
}

/** Props for the pulsing block. */
interface IBlockProps {
  /** Size classes: width, height and rounding. */
  className: string
}

/**
 * One gray rounded block that pulses, or sits still under reduced motion.
 * @returns A rounded block of the requested size.
 */
const Block = ({ className }: IBlockProps): ReactElement => {
  const reduced = useReducedMotion()

  return (
    <View
      className={ClassHelper.cn(
        'rounded-lg bg-bg-sunken',
        reduced ? 'animate-none' : 'animate-pulse',
        className,
      )}
    />
  )
}

/**
 * Loading is shape-first. The group is one busy region named "Loading"; the shapes are decoration.
 * @returns The placeholder, announced as a single busy region.
 */
export const Skeleton = ({ count = 1, variant = 'row' }: ISkeletonProps): ReactElement => {
  const { t } = useT()

  if (variant === 'card') {
    return (
      <View
        accessibilityLabel={t('common.loading')}
        accessible
        aria-busy
        className="overflow-hidden rounded-2xl border border-border bg-bg-raised"
      >
        <Block className="h-40 w-full rounded-none" />
        <View className="gap-1 px-4 pt-3 pb-4">
          <Block className="h-5 w-3/5" />
          <Block className="h-3.5 w-2/5" />
          <Block className="h-3.5 w-3/10" />
        </View>
      </View>
    )
  }

  return (
    <View accessibilityLabel={t('common.loading')} accessible aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <View className="flex-row items-center gap-3 px-4 py-3" key={index}>
          <Block className="size-10 rounded-full" />
          <View className="flex-1 gap-2">
            <Block className={index % 2 === 0 ? 'h-3.5 w-3/5' : 'h-3.5 w-9/20'} />
            <Block className={index % 2 === 0 ? 'h-3 w-2/5' : 'h-3 w-3/10'} />
          </View>
        </View>
      ))}
    </View>
  )
}
