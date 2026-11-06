import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

/** The route name of the tab's own screen, as the file under squads/ spells it. */
const HOME = 'index'

/**
 * The stack inside the Squads tab, so its screen gets the iOS header with its title.
 * @returns The stack of the Squads tab.
 */
export default function SquadsLayout(): ReactElement {
  const { t } = useT()

  return (
    <TabStack>
      <Stack.Screen name={HOME} options={{ title: t('titles.squads') }} />
    </TabStack>
  )
}
