import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { BottomNav, cn, PageHeader, SideNav, TopAppBar, useBreakpoint } from '@roundup/ui'

import type { TabItem } from './tabs.ts'

import { layoutFor } from './layout-for.ts'
import { TAB_ITEMS } from './tabs.ts'

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
  const { t } = useT()
  const { width } = useBreakpoint()
  const { gutter, nav } = layoutFor(width)
  const title = t(`nav.tabs.${current}`)

  const navItems = TAB_ITEMS.map(({ href, icon, id }) => ({
    href,
    icon,
    id,
    label: t(`nav.tabs.${id}`),
  }))

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
