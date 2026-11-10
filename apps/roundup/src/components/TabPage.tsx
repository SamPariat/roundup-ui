import type { ReactElement, ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'

import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { cn } from '@roundup/ui'

import { TabFabLayer } from '@/components/TabFabLayer'
import { useLayout } from '@/hooks/useLayout'

/** Props for TabPage. */
export interface ITabPageProps {
  /** The page content. */
  children: ReactNode
  /** Centers the content in the visible area instead of scrolling it, for an empty state. */
  centered?: boolean
  /** The screen's FloatingActionButton, floated over the bottom-right of the content. */
  fab?: ReactElement | undefined
}

/** Fills the screen; SafeAreaView takes a style, not a className. */
const FILL: ViewStyle = { flex: 1 }

/** The edges of the visible area on iOS: below the header and above the floating tab bar. */
const VISIBLE: readonly Edge[] = ['top', 'bottom']

/**
 * The body of every screen inside a tab: centered at most max-content wide, with the side gutter.
 * It scrolls, and iOS insets it below its glass header. A centered body does not scroll: on iOS it
 * sits in the native safe area, which leaves out the floating header and tab bar, so the content
 * lands in the middle of what the person can see. A scrolling body can carry a floating button,
 * with room left below the content so the last row scrolls clear of it.
 * @returns The scrolling or centered page.
 */
export const TabPage = ({ centered = false, children, fab }: ITabPageProps): ReactElement => {
  const { gutterClass, systemChrome } = useLayout()
  const frame = cn('mx-auto w-full max-w-content', gutterClass)

  if (!centered) {
    return (
      <View className="flex-1">
        <ScrollView
          contentContainerClassName={cn('pt-6', fab === undefined ? 'pb-6' : 'pb-24', frame)}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {fab === undefined ? null : <TabFabLayer>{fab}</TabFabLayer>}
      </View>
    )
  }

  const body = <View className={cn('flex-1 justify-center py-6', frame)}>{children}</View>

  return systemChrome ? (
    <SafeAreaView edges={VISIBLE} style={FILL}>
      {body}
    </SafeAreaView>
  ) : (
    body
  )
}
