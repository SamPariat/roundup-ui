import type { ReactElement, ReactNode } from 'react'

import { useMemo } from 'react'
import { View } from 'react-native'

import type { INavUser } from '@roundup/ui'

import { useDeps, useMe } from '@roundup/core'
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
 * The navigation around the tabs on web and Android: SideNav from 1024 wide up, with the signed-in
 * person (avatar, name and phone) pinned to its foot once their profile has loaded, and BottomNav
 * below. The bar above each screen is drawn by its tab's stack (TabHeader), from its own title.
 * @returns The page frame: the nav and the routed screen.
 */
export const AppShell = ({ children, current }: IAppShellProps): ReactElement => {
  const { nav } = useLayout()
  const items = useTabItems()
  const { me } = useMe()
  const { helpers } = useDeps()

  const user = useMemo((): INavUser | undefined => {
    if (me === undefined) return undefined

    return {
      id: me.id,
      name: me.name,
      phone: helpers.phone.isE164(me.phone) ? helpers.phone.format(me.phone) : me.phone,
      ...(me.avatarURL === '' ? {} : { src: me.avatarURL }),
    }
  }, [helpers, me])

  // The person at the foot of the side nav, once their profile has loaded.
  const signedIn = user === undefined ? {} : { user }

  return (
    <View className={cn('flex-1 bg-bg', nav === 'side' && 'flex-row')}>
      {nav === 'side' ? <SideNav items={items} value={current} {...signedIn} /> : null}
      <View className="min-w-0 flex-1">
        {children}
        {nav === 'bottom' ? <BottomNav items={items} value={current} /> : null}
      </View>
    </View>
  )
}
