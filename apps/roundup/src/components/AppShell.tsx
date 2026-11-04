import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { BottomNav, cn, PageHeader, SideNav, TopAppBar } from '@roundup/ui'

import type { ITabItem } from '../hooks/useTabItems'

import { useLayout } from '../hooks/useLayout'
import { useTabItems } from '../hooks/useTabItems'

/** Props for AppShell. */
export interface IAppShellProps {
  /** Which tab is showing. */
  current: ITabItem['id']
  /** The routed screen. */
  children: ReactNode
}

/**
 * SideNav and PageHeader from 1024 wide up; TopAppBar and BottomNav below. The items are the
 * same everywhere, only the chrome changes. Past 1600 wide the side nav and content stay together
 * as one centered, framed block instead of the nav sitting at the far left edge.
 * @returns The page frame: nav, title and content.
 */
export const AppShell = ({ children, current }: IAppShellProps): ReactElement => {
  const { nav } = useLayout()
  const items = useTabItems()
  const navItems = items.map(({ href, icon, id, label }) => ({ href, icon, id, label }))
  const title = items.find((item) => item.id === current)?.title ?? ''

  return (
    <View className="flex-1 bg-bg">
      <View
        className={cn(
          'mx-auto w-full max-w-app flex-1 border-border app:border-x',
          nav === 'side' && 'flex-row',
        )}
      >
        {nav === 'side' ? <SideNav items={navItems} value={current} /> : null}
        <View className="min-w-0 flex-1">
          {nav === 'bottom' ? <TopAppBar logo title={title} /> : null}
          <View className="mx-auto w-full max-w-content flex-1 px-4 md:px-8">
            {nav === 'side' ? (
              <View className="pt-8 pb-6">
                <PageHeader title={title} />
              </View>
            ) : null}
            {children}
          </View>
          {nav === 'bottom' ? <BottomNav items={navItems} value={current} /> : null}
        </View>
      </View>
    </View>
  )
}
