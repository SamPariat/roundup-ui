import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { cn } from '../lib/cn.ts'
import { SafeArea } from './SafeArea.tsx'

/** Props for Screen. */
export interface ScreenProps {
  /**
   * Chrome above the content, usually a TopAppBar. The header keeps clear of the status bar itself
   * (so its surface can run under it), which is why the body then skips the top inset.
   */
  header?: ReactNode
  /** The page content. */
  children: ReactNode
  /** Extra classes for the body, such as a gutter or alignment. */
  className?: string
}

/** Edges the body pads when a header already covers the top. */
const BELOW_HEADER = ['right', 'bottom', 'left'] as const

/** Edges the body pads when nothing sits above it. */
const ALL_EDGES = ['top', 'right', 'bottom', 'left'] as const

/**
 * A full-screen page outside the app shell (Welcome, sign-in, OTP): the page background, an
 * optional header and a body kept clear of the notch, the status bar and the home indicator.
 * Screens inside the shell get the same from AppShell or the iOS tab layout, so they do not use it.
 * @returns The page with its header and body.
 */
export const Screen = ({ children, className, header }: ScreenProps): ReactElement => (
  <View className="flex-1 bg-bg">
    {header}
    <SafeArea
      className={cn('flex-1', className)}
      edges={header === undefined ? ALL_EDGES : BELOW_HEADER}
    >
      {children}
    </SafeArea>
  </View>
)
