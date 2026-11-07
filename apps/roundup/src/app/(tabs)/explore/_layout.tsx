import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

/**
 * The stack inside the Explore tab, so its screen gets the iOS header with its title.
 * @returns The stack of the Explore tab.
 */
export default function ExploreLayout(): ReactElement {
  const { t } = useT()

  return (
    <TabStack>
      <Stack.Screen name="index" options={{ title: t('titles.explore') }} />
    </TabStack>
  )
}
