import type { ReactElement, ReactNode } from 'react'
import type { ViewProps } from 'react-native'

import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** A screen edge that can carry a safe-area inset. */
type Edge = 'bottom' | 'left' | 'right' | 'top'

/** Props for SafeArea: the usual View props plus which edges to pad. */
export type SafeAreaProps = ViewProps & {
  /** What to keep inside the safe area. */
  children?: ReactNode
  /** Extra classes for the wrapper. */
  className?: string
  /** Which edges to pad. Each edge reads its own inset, so a notch, a hinge or a gesture bar on one side never affects the others. */
  edges: readonly Edge[]
}

/**
 * Insets are runtime numbers, which a class cannot express, so this is the one place they become padding.
 * @returns The padded wrapper.
 */
export const SafeArea = ({ children, edges, ...props }: SafeAreaProps): ReactElement => {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
      }}
      {...props}
    >
      {children}
    </View>
  )
}
