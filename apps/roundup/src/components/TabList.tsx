import type { ReactElement, ReactNode } from 'react'
import type { ListRenderItemInfo } from 'react-native'

import { useCallback } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'

import type { TBreakpoint } from '@roundup/ui'

import { cn, Skeleton, useBreakpoint } from '@roundup/ui'

import { TabFabLayer } from '@/components/TabFabLayer'
import { useLayout } from '@/hooks/useLayout'

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
  /** The shape of those placeholders: list rows, or venue cards in the list's own columns. Defaults to rows. */
  skeleton?: 'card' | 'row'
  /** Content above the items. */
  header?: ReactElement | undefined
  /** True while a later page loads: draws one more row of the same placeholders below the items. */
  loadingMore?: boolean
  /** True while a pull to refresh runs. */
  refreshing?: boolean
  /** Called when the person pulls the list down. Leaving it out turns pull to refresh off. */
  onRefresh?: () => void
  /** Called when the end of the list comes into view. */
  onEndReached?: () => void
  /** The screen's FloatingActionButton, floated over the bottom-right of the list. */
  fab?: ReactElement | undefined
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

/** The keys of the placeholder cards the first load draws, six at most. */
const CARD_PLACEHOLDERS: readonly string[] = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
]

/** How many placeholder cards a column count draws: two on a phone, six in a grid. */
const CARD_COUNT: Record<number, number> = { 1: 2, 2: 6, 3: 6 }

/** The width of a placeholder card in each column count. */
const CARD_WIDTH: Record<number, string> = { 1: 'w-full', 2: 'w-1/2', 3: 'w-1/3' }

/**
 * The body of a tab screen that is a list: the FlatList sibling of TabPage. It insets below the
 * iOS header, takes the same width cap and side gutter and centers the empty state in the visible area. It
 * lays items out in one column on phones and more on wider screens. A list must never sit inside
 * TabPage's ScrollView, which would load every item at once. With a floating button the list
 * leaves room below its last row, so that row scrolls clear of the button.
 * @returns The virtualized list.
 */
export const TabList = <T,>({
  data,
  empty,
  fab,
  header,
  keyExtractor,
  loading = false,
  loadingMore = false,
  onEndReached,
  onRefresh,
  refreshing = false,
  renderItem,
  skeleton = 'row',
}: ITabListProps<T>): ReactElement => {
  const { gutterClass } = useLayout()
  const { breakpoint } = useBreakpoint()
  const columns = COLUMNS[breakpoint]

  const cell = useCallback(
    ({ item }: ListRenderItemInfo<T>): ReactElement => (
      <View className={cn('min-w-0 flex-1 p-1.5', CELL_WIDTH[columns])}>{renderItem(item)}</View>
    ),
    [columns, renderItem],
  )

  // The cells carry 6 points of padding on every side, so the list itself sits 6 outside the gutter
  // to keep the cards on it, and the header takes the 6 back and adds the last 6 of the 12 row gap.
  // The negative margin goes on a plain wrapping View: iOS ignores margins on a scroll view's
  // content container, and on the web a FlatList's own className lands on two nested elements.
  const headerBox =
    header === undefined ? undefined : <View className="px-1.5 pb-1.5">{header}</View>

  // Placeholders sit in the same padded cells as the items, so they line up with the cards and
  // take a card's width instead of the list's.
  /**
   * Draws placeholder cards in the list's columns.
   * @param count - How many cards to draw.
   * @returns The wrapped cards.
   */
  const cards = (count: number): ReactElement => (
    <View className="flex-row flex-wrap">
      {CARD_PLACEHOLDERS.slice(0, count).map((key) => (
        <View className={cn('p-1.5', CARD_WIDTH[columns])} key={key}>
          <Skeleton variant="card" />
        </View>
      ))}
    </View>
  )

  /**
   * Draws placeholder rows.
   * @param count - How many placeholder rows to stack.
   * @returns The padded stack of rows.
   */
  const rows = (count: number): ReactElement => (
    <View className="px-1.5">
      <Skeleton count={count} />
    </View>
  )

  const loadingPlaceholder =
    skeleton === 'card' ? cards(CARD_COUNT[columns] ?? columns) : rows(PLACEHOLDERS)

  const moreFooter = skeleton === 'card' ? cards(columns) : rows(1)

  const placeholder = loading ? (
    loadingPlaceholder
  ) : (
    <View className="flex-1 justify-center px-1.5">{empty}</View>
  )

  return (
    <View className="flex-1">
      <View className="-mx-1.5 flex-1">
        <FlatList
          contentContainerClassName={cn(
            'mx-auto w-full max-w-content grow pt-4.5',
            fab === undefined ? 'pb-4.5' : 'pb-24',
            gutterClass,
          )}
          contentInsetAdjustmentBehavior="automatic"
          data={data}
          key={columns}
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          ListEmptyComponent={placeholder}
          ListFooterComponent={loadingMore ? moreFooter : undefined}
          ListHeaderComponent={headerBox}
          numColumns={columns}
          onEndReached={onEndReached}
          refreshControl={
            onRefresh === undefined ? undefined : (
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            )
          }
          renderItem={cell}
        />
      </View>
      {fab === undefined ? null : <TabFabLayer>{fab}</TabFabLayer>}
    </View>
  )
}
