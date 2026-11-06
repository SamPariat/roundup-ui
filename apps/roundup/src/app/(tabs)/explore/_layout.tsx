import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

/** The route name of the tab's own screen, as the file under explore/ spells it. */
const HOME = 'index'

/**
 * The stack inside the Explore tab, so its screen gets the iOS header with its title.
 * @returns The stack of the Explore tab.
 */
export default function ExploreLayout(): ReactElement {
  const { t } = useT()

  return (
    <TabStack>
      <Stack.Screen name={HOME} options={{ title: t('titles.explore') }} />
    </TabStack>
  )
}
