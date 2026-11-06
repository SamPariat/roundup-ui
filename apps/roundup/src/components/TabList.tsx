import type { ReactElement, ReactNode } from 'react'
import type { ListRenderItemInfo } from 'react-native'

import { useCallback } from 'react'
import { FlatList, Platform, RefreshControl, View } from 'react-native'

import type { TBreakpoint } from '@roundup/ui'

import { cn, Skeleton, useBreakpoint } from '@roundup/ui'

import { useLayout } from '../hooks/useLayout'

/** Props for TabList. */
export interface ITabListProps<T> {
  /** The items to list. */
  data: readonly T[]
  /** Draws one item. */
  renderItem: (item: T) => ReactElement
  /** The stable key of an item. */
  keyExtractor: (item: T) => string
  /** What to show, centered, when there are no items: usually an EmptyState. */
  empty: ReactNode
  /** True while the first page loads: shows placeholders instead of `empty`. */
  loading?: boolean
  /** Content above the items. */
  header?: ReactElement | undefined
  /** Content below the items, such as a placeholder while more load. */
  footer?: ReactElement | undefined
  /** True while a pull to refresh runs. */
  refreshing?: boolean
  /** Called when the person pulls the list down. Leaving it out turns pull to refresh off. */
  onRefresh?: () => void
  /** Called when the end of the list comes into view. */
  onEndReached?: () => void
}

/** How many columns each layout step has. */
const COLUMNS: Record<TBreakpoint, number> = {
  desktop: 3,
  phone: 1,
  tablet: 2,
}

/** The widest an item gets in each column count, so a short last row keeps the same width. */
const CELL_WIDTH: Record<number, string> = {
  1: 'max-w-full',
  2: 'max-w-1/2',
  3: 'max-w-1/3',
}

/** How many placeholder rows the first load draws. */
const PLACEHOLDERS = 5

/**
 * The body of a tab screen that is a list: the FlatList sibling of TabPage. It insets below the
 * iOS header, takes the same iOS side gutter and centers the empty state in the visible area. It
 * lays items out in one column on phones and more on wider screens. A list must never sit inside
 * TabPage's ScrollView, which would load every item at once.
 * @returns The virtualized list.
 */
export const TabList = <T,>({
  data,
  empty,
  footer,
  header,
  keyExtractor,
  loading = false,
  onEndReached,
  onRefresh,
  refreshing = false,
  renderItem,
}: ITabListProps<T>): ReactElement => {
  const { gutter } = useLayout()
  const { breakpoint } = useBreakpoint()
  const columns = COLUMNS[breakpoint]
  const sides = Platform.OS === 'ios' && (gutter === 32 ? 'px-8' : 'px-4')

  const cell = useCallback(
    ({ item }: ListRenderItemInfo<T>): ReactElement => (
      <View className={cn('min-w-0 flex-1 p-1.5', CELL_WIDTH[columns])}>{renderItem(item)}</View>
    ),
    [columns, renderItem],
  )

  const placeholder = loading ? (
    <Skeleton count={PLACEHOLDERS} />
  ) : (
    <View className="flex-1 justify-center">{empty}</View>
  )

  return (
    <FlatList
      contentContainerClassName={cn('grow py-6', sides)}
      contentInsetAdjustmentBehavior="automatic"
      data={data}
      key={columns}
      keyboardShouldPersistTaps="handled"
      keyExtractor={keyExtractor}
      ListEmptyComponent={placeholder}
      ListFooterComponent={footer}
      ListHeaderComponent={header}
      numColumns={columns}
      onEndReached={onEndReached}
      refreshControl={
        onRefresh === undefined ? undefined : (
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        )
      }
      renderItem={cell}
    />
  )
}
