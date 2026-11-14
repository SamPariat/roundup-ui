import type { ReactElement } from 'react'
import type { ViewStyle } from 'react-native'
import type { Edge } from 'react-native-safe-area-context'

import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { cn } from '@roundup/ui'

import { useLayout } from '@/hooks/useLayout'

/** Props for TabFabLayer. */
export interface ITabFabLayerProps {
  /** The screen's FloatingActionButton. */
  children: ReactElement
}

/** Covers the screen and centers the content column; SafeAreaView takes a style, not a className. */
const LAYER: ViewStyle = {
  alignItems: 'center',
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
}

/**
 * The edges iOS's floating tab bar can cover: the bottom on a phone, and a side on the open iPhone
 * Duo in landscape, where it stands upright along the edge. The layer is absolute, so it does not
 * sit inside TabSides' padding and takes the side insets itself.
 */
const TAB_BAR_EDGES: readonly Edge[] = ['bottom', 'left', 'right']

/**
 * Lays a FloatingActionButton over a TabPage or TabList body. The button lands in the corner of the
 * content column (the same max width and gutter as the content, so on a wide screen it sits beside
 * the cards rather than at the window's edge). On iOS the layer stops at the safe area, which
 * leaves out the floating tab bar, below or beside the content. Taps outside the button reach the content beneath.
 * @returns The layer holding the button.
 */
export const TabFabLayer = ({ children }: ITabFabLayerProps): ReactElement => {
  const { gutterClass, systemChrome } = useLayout()

  const column = (
    <View className={cn('w-full max-w-content flex-1', gutterClass)} pointerEvents="box-none">
      <View className="flex-1" pointerEvents="box-none">
        {children}
      </View>
    </View>
  )

  return systemChrome ? (
    <SafeAreaView edges={TAB_BAR_EDGES} pointerEvents="box-none" style={LAYER}>
      {column}
    </SafeAreaView>
  ) : (
    <View className="absolute inset-0 items-center" pointerEvents="box-none">
      {column}
    </View>
  )
}
