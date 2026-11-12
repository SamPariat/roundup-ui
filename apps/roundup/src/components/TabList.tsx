import type { ReactElement, ReactNode } from 'react'
import type { LayoutChangeEvent, ListRenderItemInfo, ViewStyle } from 'react-native'

import { useHeaderHeight } from 'expo-router/react-navigation'
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
  /**
   * Content that stays above the list while the items scroll beneath it, as Explore's filters do.
   * It sits on the page background, takes the list's width and gutter, and on iOS starts below
   * the translucent header bar.
   */
  top?: ReactElement | undefined
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

/** The centered, width-capped column that the list's content and the content above it share. */
const FRAME = 'mx-auto w-full max-w-content'

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
  refreshing = false,
  renderItem,
  skeleton = 'row',
  top,
}: ITabListProps<T>): ReactElement => {
  const { gutter, gutterClass, systemChrome } = useLayout()
  const headerHeight = useHeaderHeight()
  const [width, setWidth] = useState<number>(0)
  const columns = columnsProp ?? Layout.columnsFor(width, gutter)

  const handleLayout = useCallback((event: LayoutChangeEvent): void => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  // A cell never grows past its column, so a short last row keeps the width of the others.
  const columnStyle = useMemo((): ViewStyle => ({ maxWidth: `${100 / columns}%` }), [columns])
  const placeholderStyle = useMemo((): ViewStyle => ({ width: `${100 / columns}%` }), [columns])

  // In a grid each row lays its cells out side by side, so flex-1 shares the row's width. A single
  // column has no row: flex-1 would act on the height there and collapse the cell to nothing, so
  // the list would measure every card as 0 tall and leave blank gaps as it scrolls.
  const cell = useCallback(
    ({ item }: ListRenderItemInfo<T>): ReactElement => (
      <View className={cn('min-w-0 p-1.5', columns > 1 && 'flex-1')} style={columnStyle}>
        {renderItem(item)}
      </View>
    ),
    [columnStyle, columns, renderItem],
  )

  // The cells carry 6 points of padding on every side, so the list itself sits 6 outside the gutter
  // to keep the cards on it, and the header takes the 6 back and adds the last 6 of the 12 row gap.
  // The negative margin goes on a plain wrapping View: iOS ignores margins on a scroll view's
  // content container, and on the web a FlatList's own className lands on two nested elements.
  // iOS draws its header bar over the screen, and the content above the list is not a scroll view,
  // so it reserves the bar's height itself, under the bar's translucent glass. The list below
  // starts under the content above it, so the items scroll beneath that, not beneath the bar.
  // Web and Android draw their bar in the layout, so they need nothing.
  const topStyle = useMemo(
    (): ViewStyle => ({ paddingTop: systemChrome ? headerHeight : 0 }),
    [headerHeight, systemChrome],
  )

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
      {top === undefined ? null : (
        <View className="bg-bg" style={topStyle}>
          <View className={cn(FRAME, 'pt-4.5 pb-1.5', gutterClass)}>{top}</View>
        </View>
      )}
      <View className="-mx-1.5 flex-1" onLayout={handleLayout}>
        <FlatList
          contentContainerClassName={cn(
            FRAME,
            // Only an empty list fills the height, to center its empty state. A list with items
            // keeps its own height: iOS insets the content for the header and the tab bar, so a
            // grown container would let a short list scroll past its last row by both insets.
            data.length === 0 && 'grow',
            header === undefined && top === undefined && 'pt-4.5',
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
