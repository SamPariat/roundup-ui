import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { Platform } from 'react-native'

import { useT } from '@roundup/i18n'
import { useRoleColor } from '@roundup/ui'

/** The route names of the profile stack, as the files under profile/ spell them. */
const ROUTES = {
  edit: 'edit',
  home: 'index',
  preferences: 'preferences',
} as const

/**
 * The stack inside the Profile tab, so Edit profile and Preferences push on top of Profile and the
 * Profile tab stays selected. Web and Android draw their own bar in AppShell, so the stack has no
 * header there. iOS has no AppShell, so the pushed screens get the system header with its title
 * and back button (the glass back button on iOS 26+), in the theme's text color, with Profile as
 * the back label; Profile itself keeps no header. The glass header floats over the content, so the
 * pushed screens put their body in a StackPage, which iOS insets below it.
 * @returns The stack of the Profile tab.
 */
export default function ProfileLayout(): ReactElement {
  const { t } = useT()
  const background = useRoleColor('bg')
  const foreground = useRoleColor('fg')
  const pushed = Platform.OS === 'ios'

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: background },
        headerShown: false,
        headerTintColor: foreground,
        headerTitleStyle: { color: foreground },
      }}
    >
      <Stack.Screen name={ROUTES.home} options={{ title: t('titles.profile') }} />
      <Stack.Screen
        name={ROUTES.edit}
        options={{ headerShown: pushed, title: t('titles.editProfile') }}
      />
      <Stack.Screen
        name={ROUTES.preferences}
        options={{ headerShown: pushed, title: t('titles.preferences') }}
      />
    </Stack>
  )
}
