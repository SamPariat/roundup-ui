import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'

import { Stack } from 'expo-router'
import { useMemo } from 'react'
import { Platform } from 'react-native'

import { useRoleColor } from '@roundup/ui'

/** Props for TabStack. */
export interface ITabStackProps {
  /** The Stack.Screen of each route in the tab, with its title. */
  children: ReactNode
}

/**
 * The stack inside a tab, so pushed screens keep the tab selected. On iOS every screen gets the
 * system header, the tab's own screen included, so pushing one never shifts the content; its
 * title and back button take the theme's text color. Web and Android draw their bar in AppShell,
 * so the stack has no header there.
 * @returns A Stack whose screens share these header options.
 */
export const TabStack = ({ children }: ITabStackProps): ReactElement => {
  const background = useRoleColor('bg')
  const foreground = useRoleColor('fg')

  const screenOptions = useMemo(
    (): NativeStackNavigationOptions => ({
      contentStyle: { backgroundColor: background },
      headerShown: Platform.OS === 'ios',
      headerTintColor: foreground,
      headerTitleStyle: { color: foreground },
    }),
    [background, foreground],
  )

  return <Stack screenOptions={screenOptions}>{children}</Stack>
}
