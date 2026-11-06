import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

/** The route names of the profile stack, as the files under profile/ spell them. */
const ROUTES = {
  edit: 'edit',
  home: 'index',
  preferences: 'preferences',
} as const

/**
 * The stack inside the Profile tab, so Edit profile and Preferences push on top of Profile and the
 * Profile tab stays selected. On iOS each has the system header with its title, and the pushed
 * ones get the back button to Profile.
 * @returns The stack of the Profile tab.
 */
export default function ProfileLayout(): ReactElement {
  const { t } = useT()

  return (
    <TabStack>
      <Stack.Screen name={ROUTES.home} options={{ title: t('titles.profile') }} />
      <Stack.Screen name={ROUTES.edit} options={{ title: t('titles.editProfile') }} />
      <Stack.Screen name={ROUTES.preferences} options={{ title: t('titles.preferences') }} />
    </TabStack>
  )
}
