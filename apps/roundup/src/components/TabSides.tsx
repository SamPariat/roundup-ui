import type { ReactElement, ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'

import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useLayout } from '@/hooks/useLayout'

/** Props for TabSides. */
export interface ITabSidesProps {
  /** The tab screen's body. */
  children: ReactNode
}

/** Fills the screen; SafeAreaView takes a style, not a className. */
const FILL: ViewStyle = { flex: 1 }

/** The sides iOS's system chrome can stand along. */
const SIDES: readonly Edge[] = ['left', 'right']

/**
 * Keeps a tab screen's body clear of system chrome along its sides. The open iPhone Duo in
 * landscape stands its tab bar, back button and header actions in a column down one edge and reports
 * that column as a side inset (84 points), so without this the cards, chips and tabs ran beneath it.
 * Web and Android draw AppShell, which lays its navigation out beside the screen instead.
 * @returns The body, inset at the sides on iOS.
 */
export const TabSides = ({ children }: ITabSidesProps): ReactElement => {
  const { systemChrome } = useLayout()

  return systemChrome ? (
    <SafeAreaView edges={SIDES} style={FILL}>
      {children}
    </SafeAreaView>
  ) : (
    <View className="flex-1">{children}</View>
  )
}
