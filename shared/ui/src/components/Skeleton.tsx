import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import { cn } from '../lib/cn'
import { useReducedMotion } from '../lib/useReducedMotion'

/** Props for Skeleton. */
export interface ISkeletonProps {
  /**
   * Which placeholder shape: a list `row`, a flush `item` row (an avatar and two lines, as in a
   * modal or a card of rows), a venue `card`, the `search` field with its chips and caption, or the
   * whole `venue` page. Defaults to row.
   */
  variant?: 'card' | 'item' | 'row' | 'search' | 'venue'
  /** How many rows to draw, for `row` and `item`. Ignored by the other shapes. Defaults to 1. */
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
      className={cn(
        'rounded-lg bg-bg-sunken',
        reduced ? 'animate-none' : 'animate-pulse',
        className,
      )}
    />
  )
}

/** Props for the item rows. */
interface IItemsProps {
  /** How many rows to draw. */
  count: number
}

/**
 * Rows of an avatar and two lines, at least 56 points tall, with no padding of their own.
 * @returns A stack of placeholder rows.
 */
const Items = ({ count }: IItemsProps): ReactElement => (
  <View>
    {Array.from({ length: count }, (_, index) => (
      <View className="min-h-14 flex-row items-center gap-3" key={index}>
        <Block className="size-10 rounded-full" />
        <View className="flex-1 gap-1.5">
          <Block className="h-3.5 w-3/5" />
          <Block className="h-3 w-19/50" />
        </View>
      </View>
    ))}
  </View>
)

/**
 * The search field, the chips and (on phones) the caption of Explore, as blocks. A fourth chip
 * joins from the tablet width, where the caption goes.
 * @returns The placeholder, announced as a single busy region.
 */
const SearchPlaceholder = (): ReactElement => {
  const { t } = useT()

  return (
    <View accessibilityLabel={t('common.loading')} accessible aria-busy className="gap-4">
      <Block className="h-12 w-full" />
      <View className="flex-row gap-2">
        <Block className="h-9 w-19" />
        <Block className="h-9 w-17" />
        <Block className="h-9 w-26" />
        <Block className="hidden h-9 w-21 md:flex" />
      </View>
      <Block className="h-3.5 w-2/5 md:hidden" />
    </View>
  )
}

/**
 * A venue's page as blocks: on phones the photo, the title, three pills, three rows and a line; from
 * the desktop width two columns, with the photo, lines and rows on the left and a raised card of
 * four lines on the right.
 * @returns The placeholder, announced as a single busy region.
 */
const VenuePlaceholder = (): ReactElement => {
  const { t } = useT()

  return (
    <View
      accessibilityLabel={t('common.loading')}
      accessible
      aria-busy
      className="gap-4 lg:flex-row lg:items-start lg:gap-8"
    >
      <View className="min-w-0 gap-4 lg:flex-1">
        <Block className="h-46 w-full lg:h-82" />
        <Block className="h-3.5 w-7/10 lg:h-5 lg:w-21/50" />
        <View className="flex-row gap-2 lg:hidden">
          <Block className="h-9 w-19" />
          <Block className="h-9 w-17" />
          <Block className="h-9 w-26" />
        </View>
        <Block className="hidden h-3.5 w-4/5 lg:flex" />
        <Block className="hidden h-5 w-21/50 lg:flex" />
        <Items count={3} />
        <Block className="h-3.5 w-1/2 lg:hidden" />
      </View>
      <View className="hidden h-80 gap-2.5 rounded-2xl border border-border bg-bg-raised p-4 lg:flex lg:w-80">
        <Block className="h-4 w-11/20" />
        <Block className="h-3 w-2/5" />
        <Block className="h-3 w-7/10" />
        <Block className="h-3 w-3/10" />
      </View>
    </View>
  )
}

/**
 * Loading is shape-first. The group is one busy region named "Loading"; the shapes are decoration.
 * @returns The placeholder, announced as a single busy region.
 */
export const Skeleton = ({ count = 1, variant = 'row' }: ISkeletonProps): ReactElement => {
  const { t } = useT()

  if (variant === 'search') return <SearchPlaceholder />

  if (variant === 'venue') return <VenuePlaceholder />

  if (variant === 'item') {
    return (
      <View accessibilityLabel={t('common.loading')} accessible aria-busy>
        <Items count={count} />
      </View>
    )
  }

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
