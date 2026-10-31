import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { BottomNav, cn, PageHeader, SideNav, TopAppBar } from '@roundup/ui'

import type { TabItem } from '../hooks/useTabItems.ts'

import { useLayout } from '../hooks/useLayout.ts'
import { useTabItems } from '../hooks/useTabItems.ts'

/** Props for AppShell. */
export interface AppShellProps {
  /** Which tab is showing. */
  current: TabItem['id']
  /** The routed screen. */
  children: ReactNode
}

/**
 * SideNav and PageHeader from 1024 wide up; TopAppBar and BottomNav below. The items are the
 * same everywhere, only the chrome changes.
 * @returns The page frame: nav, title and content.
 */
export const AppShell = ({ children, current }: AppShellProps): ReactElement => {
  const { gutter, nav } = useLayout()
  const items = useTabItems()
  const navItems = items.map(({ href, icon, id, label }) => ({ href, icon, id, label }))
  const title = items.find((item) => item.id === current)?.label ?? ''

  return (
    <View className={cn('flex-1 bg-bg', nav === 'side' && 'flex-row')}>
      {nav === 'side' ? <SideNav items={navItems} value={current} /> : null}
      <View className="min-w-0 flex-1">
        {nav === 'bottom' ? <TopAppBar logo title={title} /> : null}
        <View
          className={cn('mx-auto w-full max-w-content flex-1', gutter === 32 ? 'px-8' : 'px-4')}
        >
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
  )
}
