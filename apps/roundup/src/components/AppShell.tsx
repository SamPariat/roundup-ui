import type { ReactElement, ReactNode } from 'react'

import { View } from 'react-native'

import { BottomNav, cn, SideNav } from '@roundup/ui'

import type { ITabItem } from '@/hooks/useTabItems'

import { useLayout } from '@/hooks/useLayout'
import { useTabItems } from '@/hooks/useTabItems'

/** Props for AppShell. */
export interface IAppShellProps {
  /** Which tab is showing. */
  current: ITabItem['id']
  /** The routed screen. */
  children: ReactNode
}

/**
 * The navigation around the tabs on web and Android: SideNav from 1024 wide up, BottomNav below.
 * The bar above each screen is drawn by its tab's stack (TabHeader), from the screen's own title.
 * @returns The page frame: the nav and the routed screen.
 */
export const AppShell = ({ children, current }: IAppShellProps): ReactElement => {
  const { nav } = useLayout()
  const items = useTabItems()

  return (
    <View className={cn('flex-1 bg-bg', nav === 'side' && 'flex-row')}>
      {nav === 'side' ? <SideNav items={items} value={current} /> : null}
      <View className="min-w-0 flex-1">
        {children}
        {nav === 'bottom' ? <BottomNav items={items} value={current} /> : null}
      </View>
    </View>
  )
}
