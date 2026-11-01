import type { ReactElement, ReactNode } from 'react'
import type { EdgeInsets } from 'react-native-safe-area-context'

import { View } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

import { cn } from '@roundup/ui'

/** Props for Preview. */
export interface PreviewProps {
  /** The component on show. */
  children: ReactNode
  /** Size and border classes for the box, such as a fixed height. */
  className?: string
  /** The safe-area insets the component sees. Defaults to none. */
  insets?: EdgeInsets
}

/** No notch, status bar or home indicator: what a component embedded in a page should see. */
const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 }

/**
 * A clipped box for a component that pads itself for the device's safe areas (TopAppBar,
 * BottomNav, Screen). Inside a catalog page it is not at the edge of the screen, so it gets its own
 * insets instead of the phone's: none by default, or a stand-in set where the padding is the point.
 * @returns The component inside the box.
 */
export const Preview = ({
  children,
  className,
  insets = NO_INSETS,
}: PreviewProps): ReactElement => (
  <SafeAreaInsetsContext value={insets}>
    <View className={cn('overflow-hidden rounded-lg', className)}>{children}</View>
  </SafeAreaInsetsContext>
)
