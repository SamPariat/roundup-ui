import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

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
      <Stack.Screen name="index" options={{ title: t('titles.profile') }} />
      <Stack.Screen name="edit" options={{ title: t('titles.editProfile') }} />
      <Stack.Screen name="preferences" options={{ title: t('titles.preferences') }} />
    </TabStack>
  )
}
