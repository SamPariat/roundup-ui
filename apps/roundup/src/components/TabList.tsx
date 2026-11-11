import type { ReactElement, ReactNode } from 'react'
import type { LayoutChangeEvent, ListRenderItemInfo, ViewStyle } from 'react-native'

import { useCallback, useMemo, useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'

import { cn, Skeleton } from '@roundup/ui'

import { TabFabLayer } from '@/components/TabFabLayer'
import { Layout, useLayout } from '@/hooks/useLayout'

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
  /** True to keep the header at the top while the items scroll under it, as Explore's filters do. */
  pinHeader?: boolean
  /** True while a later page loads: draws one more row of the same placeholders below the items. */
  loadingMore?: boolean
  /** True while a pull to refresh runs. */
  refreshing?: boolean
  /** Called when the person pulls the list down. Leaving it out turns pull to refresh off. */
  onRefresh?: (() => void) | undefined
  /** Called when the end of the list comes into view. */
  onEndReached?: (() => void) | undefined
  /** The screen's FloatingActionButton, floated over the bottom-right of the list. */
  fab?: ReactElement | undefined
  /** Forces this many columns instead of fitting as many cards as the width allows, for a list that is not a grid of cards. */
  columns?: number | undefined
}

/** How many placeholder rows the first load draws. */
const PLACEHOLDERS = 5

/** The keys of the placeholder cards the first load draws, eight at most. */
const CARD_PLACEHOLDERS: readonly string[] = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
]

/** How many placeholder cards the first load draws: two on a phone, two rows in a grid. */
const CARD_ROWS = 2

/** Header content sticks to the top of the list: the header is the list's first child. */
const STICKY_HEADER: number[] = [0]

/**
 * The body of a tab screen that is a list: the FlatList sibling of TabPage. It insets below the
 * iOS header, takes the same width cap and side gutter and centers the empty state in the visible area. It
 * lays items out in one column on phones and more on wider screens. A list must never sit inside
 * TabPage's ScrollView, which would load every item at once. With a floating button the list
 * leaves room below its last row, so that row scrolls clear of the button.
 * @returns The virtualized list.
 */
export const TabList = <T,>({
  columns: columnsProp,
  data,
  empty,
  fab,
  header,
  keyExtractor,
  loading = false,
  loadingMore = false,
  onEndReached,
  onRefresh,
  pinHeader = false,
  refreshing = false,
  renderItem,
  skeleton = 'row',
}: ITabListProps<T>): ReactElement => {
  const { gutter, gutterClass } = useLayout()
  const [width, setWidth] = useState<number>(0)
  const columns = columnsProp ?? Layout.columnsFor(width, gutter)

  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  // A cell never grows past its column, so a short last row keeps the width of the others.
  const columnStyle = useMemo((): ViewStyle => ({ maxWidth: `${100 / columns}%` }), [columns])
  const placeholderStyle = useMemo((): ViewStyle => ({ width: `${100 / columns}%` }), [columns])

  const cell = useCallback(
    ({ item }: ListRenderItemInfo<T>): ReactElement => (
      <View className="min-w-0 flex-1 p-1.5" style={columnStyle}>
        {renderItem(item)}
      </View>
    ),
    [columnStyle, renderItem],
  )

  // The cells carry 6 points of padding on every side, so the list itself sits 6 outside the gutter
  // to keep the cards on it, and the header takes the 6 back and adds the last 6 of the 12 row gap.
  // The negative margin goes on a plain wrapping View: iOS ignores margins on a scroll view's
  // content container, and on the web a FlatList's own className lands on two nested elements.
  const headerBox =
    header === undefined ? undefined : <View className="bg-bg px-1.5 pt-4.5 pb-1.5">{header}</View>

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
        <View className="p-1.5" key={key} style={placeholderStyle}>
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

  const loadingPlaceholder = skeleton === 'card' ? cards(columns * CARD_ROWS) : rows(PLACEHOLDERS)

  const moreFooter = skeleton === 'card' ? cards(columns) : rows(1)

  const placeholder = loading ? (
    loadingPlaceholder
  ) : (
    <View className="flex-1 justify-center px-1.5">{empty}</View>
  )

  return (
    <View className="flex-1">
      <View className="-mx-1.5 flex-1" onLayout={handleLayout}>
        <FlatList
          contentContainerClassName={cn(
            'mx-auto w-full max-w-content grow',
            header === undefined && 'pt-4.5',
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
          stickyHeaderIndices={header !== undefined && pinHeader ? STICKY_HEADER : undefined}
        />
      </View>
      {fab === undefined ? null : <TabFabLayer>{fab}</TabFabLayer>}
    </View>
  )
}
