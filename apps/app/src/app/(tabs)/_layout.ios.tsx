import type { ReactElement } from 'react'

import { NativeTabs } from 'expo-router/native-tabs'

import { TAB_ITEMS } from '../../shell/tabs.ts'

// iOS draws the system tab bar: Liquid Glass on iOS 26+, and a sidebar on iPad and on the open
// iPhone Duo in landscape. Same items, routes and order as the web and Android shell.
export default function TabsLayout(): ReactElement {
  return (
    <NativeTabs minimizeBehavior="onScrollDown" sidebarAdaptable>
      {TAB_ITEMS.map((item) => (
        <NativeTabs.Trigger key={item.id} name={item.id}>
          <NativeTabs.Trigger.Icon sf={item.symbol} />
          <NativeTabs.Trigger.Label>{item.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}
