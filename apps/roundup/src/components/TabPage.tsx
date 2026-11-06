import type { ReactElement, ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'

import { Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { cn } from '@roundup/ui'

import { useLayout } from '../hooks/useLayout'

/** Props for TabPage. */
export interface ITabPageProps {
  /** The page content. */
  children: ReactNode
  /** Centers the content in the visible area instead of scrolling it, for an empty state. */
  centered?: boolean
}

/** Fills the screen; SafeAreaView takes a style, not a className. */
const FILL: ViewStyle = { flex: 1 }

/** The edges of the visible area on iOS: below the header and above the floating tab bar. */
const VISIBLE: readonly Edge[] = ['top', 'bottom']

/**
 * The body of every screen inside a tab. On iOS the header and the tab bar are glass and float over
 * the screen, so the body keeps clear of both and takes the side gutter, which AppShell gives it
 * elsewhere. It scrolls, and iOS insets it below the header. A centered body does not scroll: it
 * sits in the native safe area, which on iOS already leaves out the header and the tab bar, so the
 * content lands in the middle of what the person can see.
 * @returns The scrolling or centered page.
 */
export const TabPage = ({ centered = false, children }: ITabPageProps): ReactElement => {
  const { gutter } = useLayout()
  const ios = Platform.OS === 'ios'
  const sides = ios && (gutter === 32 ? 'px-8' : 'px-4')

  if (!centered) {
    return (
      <ScrollView
        contentContainerClassName={cn('py-6', sides)}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    )
  }

  const body = <View className={cn('flex-1 justify-center py-6', sides)}>{children}</View>

  return ios ? (
    <SafeAreaView edges={VISIBLE} style={FILL}>
      {body}
    </SafeAreaView>
  ) : (
    body
  )
}
