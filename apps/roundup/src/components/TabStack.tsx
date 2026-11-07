import type { NativeStackHeaderProps, NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'

import { Stack } from 'expo-router'
import { useMemo } from 'react'

import { useRoleColor } from '@roundup/ui'

import { TabHeader } from '@/components/TabHeader'
import { useLayout } from '@/hooks/useLayout'

/**
 * Renders the web and Android bar for a screen. A plain function, as the stack's header option
 * expects, that mounts TabHeader as a component so its hooks belong to it.
 * @param props - The screen's options, route and navigation.
 * @returns The bar.
 */
const renderTabHeader = (props: NativeStackHeaderProps): ReactElement => <TabHeader {...props} />

/** Props for TabStack. */
export interface ITabStackProps {
  /** The Stack.Screen of each route in the tab, with its title. */
  children: ReactNode
}

/**
 * The stack inside a tab, so pushed screens keep the tab selected. Every screen gets a header, so
 * pushing one never shifts the content. Titles are written once, in the stack layout:
 * - iOS shows the system header with the title, a back chevron without a label on a pushed screen
 *   and the screen's headerRight.
 * - Web and Android draw TabHeader from the same options: the title, a back button on a pushed
 *   screen and the headerRight actions.
 * @returns A Stack whose screens share these header options.
 */
export const TabStack = ({ children }: ITabStackProps): ReactElement => {
  const { systemChrome } = useLayout()
  const background = useRoleColor('bg')
  const foreground = useRoleColor('fg')

  const screenOptions = useMemo(
    (): NativeStackNavigationOptions =>
      systemChrome
        ? {
            contentStyle: { backgroundColor: background },
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: foreground,
          }
        : { contentStyle: { backgroundColor: background }, header: renderTabHeader },
    [background, foreground, systemChrome],
  )

  return <Stack screenOptions={screenOptions}>{children}</Stack>
}
