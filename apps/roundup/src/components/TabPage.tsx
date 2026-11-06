import type { ReactElement, ReactNode } from 'react'

import { Platform, ScrollView } from 'react-native'

import { cn } from '@roundup/ui'

import { useLayout } from '../hooks/useLayout'

/** Props for TabPage. */
export interface ITabPageProps {
  /** The page content. */
  children: ReactNode
}

/**
 * The body of every screen inside a tab. It scrolls and fills the height, so an empty state can
 * center itself. On iOS the system header is glass and floats over the content, so iOS insets the
 * body below it, and the body takes the side gutter, which AppShell gives it elsewhere.
 * @returns The scrolling page.
 */
export const TabPage = ({ children }: ITabPageProps): ReactElement => {
  const { gutter } = useLayout()
  const ios = Platform.OS === 'ios'

  return (
    <ScrollView
      contentContainerClassName={cn('grow py-6', ios && (gutter === 32 ? 'px-8' : 'px-4'))}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}
