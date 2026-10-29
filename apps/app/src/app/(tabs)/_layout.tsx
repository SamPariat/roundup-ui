import type { ReactElement } from 'react'

import { usePathname } from 'expo-router'
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui'

import { AppShell } from '../../shell/AppShell.tsx'
import { TAB_ITEMS, tabIdForPath } from '../../shell/tabs.ts'

/**
 * Web and Android: expo-router's headless Tabs own the routing, and AppShell draws the chrome
 * (SideNav from 1024 wide, BottomNav below). The TabList is hidden because AppShell's nav
 * does the pressing. iOS has its own system tab bar in _layout.ios.tsx.
 * @returns The headless tabs wrapped in the app shell.
 */
export default function TabsLayout(): ReactElement {
  const current = tabIdForPath(usePathname())

  return (
    <Tabs>
      <TabList className="hidden">
        {TAB_ITEMS.map((item) => (
          <TabTrigger href={item.href} key={item.id} name={item.id} />
        ))}
      </TabList>
      <AppShell current={current}>
        <TabSlot />
      </AppShell>
    </Tabs>
  )
}
