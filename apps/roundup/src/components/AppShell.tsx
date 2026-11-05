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
 * same everywhere, only the chrome changes.
 * @returns The page frame: nav, title and content.
 */
export const AppShell = ({ children, current }: IAppShellProps): ReactElement => {
  const { gutter, nav } = useLayout()
  const items = useTabItems()
  const title = items.find((item) => item.id === current)?.title ?? ''

  return (
    <View className={cn('flex-1 bg-bg', nav === 'side' && 'flex-row')}>
      {nav === 'side' ? <SideNav items={items} value={current} /> : null}
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
        {nav === 'bottom' ? <BottomNav items={items} value={current} /> : null}
      </View>
    </View>
  )
}
