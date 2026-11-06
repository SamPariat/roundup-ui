import type { ReactElement } from 'react'

import { NativeTabs } from 'expo-router/native-tabs'
import { useMemo } from 'react'

import { useRoleColor } from '@roundup/ui'

import { useTabItems } from '../../hooks/useTabItems'

/**
 * iOS draws the system tab bar: Liquid Glass on iOS 26+, and a sidebar on iPad and on the open
 * iPhone Duo in landscape. Same items, routes and order as the web and Android shell.
 * @returns The system tab bar with one trigger per destination.
 */
export default function TabsLayout(): ReactElement {
  const items = useTabItems()
  // The system tab bar and the screens behind it take no className, so the theme's role colors
  // are read here: the selected tab in the accent and each screen on the page background. Each
  // tab's stack draws the header, and TabPage insets the body below it and adds the gutter.
  const accent = useRoleColor('accent')
  const background = useRoleColor('bg')

  const contentStyle = useMemo(() => ({ backgroundColor: background }), [background])

  return (
    <NativeTabs minimizeBehavior="onScrollDown" sidebarAdaptable tintColor={accent}>
      {items.map((item) => (
        <NativeTabs.Trigger contentStyle={contentStyle} key={item.id} name={item.id}>
          <NativeTabs.Trigger.Icon sf={item.symbol} />
          <NativeTabs.Trigger.Label>{item.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}
