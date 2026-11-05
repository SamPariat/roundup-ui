import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { BottomNav, cn, PageHeader, SideNav, TopAppBar } from '@roundup/ui'

import type { ITabItem } from '../hooks/useTabItems'

import { useBack } from '../hooks/useBack'
import { useLayout } from '../hooks/useLayout'
import { useNestedTitle, useTabItems } from '../hooks/useTabItems'

/** Props for AppShell. */
export interface IAppShellProps {
  /** Which tab is showing. */
  current: ITabItem['id']
  /** The routed screen. */
  children: ReactNode
}

/**
 * SideNav and PageHeader from 1024 wide up; TopAppBar and BottomNav below. The items are the
 * same everywhere, only the chrome changes. A screen pushed inside a tab (Edit profile) shows its
 * own title and a back button in place of the logo.
 * @returns The page frame: nav, title and content.
 */
export const AppShell = ({ children, current }: IAppShellProps): ReactElement => {
  const { gutter, nav } = useLayout()
  const items = useTabItems()
  const navItems = items.map(({ href, icon, id, label }) => ({ href, icon, id, label }))
  const { t } = useT()
  const goBack = useBack()
  const nestedTitle = useNestedTitle()
  const title = nestedTitle ?? items.find((item) => item.id === current)?.title ?? ''
  const backProps = nestedTitle === undefined ? {} : { onBack: goBack }

  const headerBackProps =
    nestedTitle === undefined ? {} : { back: t('common.back'), onBack: goBack }

  return (
    <View className={cn('flex-1 bg-bg', nav === 'side' && 'flex-row')}>
      {nav === 'side' ? <SideNav items={navItems} value={current} /> : null}
      <View className="min-w-0 flex-1">
        {nav === 'bottom' ? (
          <TopAppBar {...backProps} logo={nestedTitle === undefined} title={title} />
        ) : null}
        <View
          className={cn('mx-auto w-full max-w-content flex-1', gutter === 32 ? 'px-8' : 'px-4')}
        >
          {nav === 'side' ? (
            <View className="pt-8 pb-6">
              <PageHeader {...headerBackProps} title={title} />
            </View>
          ) : null}
          {children}
        </View>
        {nav === 'bottom' ? <BottomNav items={navItems} value={current} /> : null}
      </View>
    </View>
  )
}
