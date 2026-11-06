import type { ReactElement } from 'react'

import { Stack } from 'expo-router'

import { useT } from '@roundup/i18n'

import { TabStack } from '../../../components/TabStack'

/** The route names of the squads stack, as the files under squads/ spell them. */
const ROUTES = {
  home: 'index',
  squad: '[squadId]',
} as const

/**
 * The stack inside the Squads tab, so Squads and a squad's page get the iOS header with their
 * titles. The squad's page replaces its default title with the squad's name once it loads.
 * @returns The stack of the Squads tab.
 */
export default function SquadsLayout(): ReactElement {
  const { t } = useT()

  return (
    <TabStack>
      <Stack.Screen name={ROUTES.home} options={{ title: t('titles.squads') }} />
      <Stack.Screen name={ROUTES.squad} options={{ title: t('titles.squad') }} />
    </TabStack>
  )
}
