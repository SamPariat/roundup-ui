import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { BottomNav, cn, PageHeader, SideNav, TopAppBar, useBreakpoint } from '@roundup/ui'

import type { TabItem } from './tabs.ts'

import { layoutFor } from './layout-for.ts'
import { TAB_ITEMS } from './tabs.ts'

export interface AppShellProps {
  current: TabItem['id']
  children: ReactNode
}

// SideNav and PageHeader from 1024 wide up; TopAppBar and BottomNav below. The items are the
// same everywhere, only the chrome changes.
export const AppShell = ({ children, current }: AppShellProps): ReactElement => {
  const { width } = useBreakpoint()
  const { gutter, nav } = layoutFor(width)
  const item = TAB_ITEMS.find((candidate) => candidate.id === current) ?? TAB_ITEMS[0]
  const title = item?.title ?? 'Roundup'
  const navItems = TAB_ITEMS.map(({ href, icon, id, label }) => ({ href, icon, id, label }))

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
