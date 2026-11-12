import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { useCallback } from 'react'

import { useT } from '@roundup/i18n'

import { TabStack } from '@/components/TabStack'
import { RouteTitle } from '@/navigation/route-title'

/** What a screen's options function is given: here, only its route and that route's params. */
interface IScreenProps {
  /** The screen's route. */
  route: {
    /** The route's params: the path segments and the query. */
    params?: object | undefined
  }
}

/**
 * The stack inside the Squads tab. A squad's page is titled from the title query parameter its
 * link carries (the squad's name, so it shows before the squad loads), and "Squad" when opened
 * from a link without one. A venue opened from a squad's favorites is a page of this stack too,
 * titled the same way as in Explore.
 * @returns The stack of the Squads tab.
 */
export default function SquadsLayout(): ReactElement {
  const { t } = useT()

  const squadOptions = useCallback(
    ({ route }: IScreenProps): NativeStackNavigationOptions => ({
      title: RouteTitle.of(route.params) ?? t('titles.squad'),
    }),
    [t],
  )

  const venueOptions = useCallback(
    ({ route }: IScreenProps): NativeStackNavigationOptions => ({
      title: RouteTitle.of(route.params) ?? t('titles.venue'),
    }),
    [t],
  )

  return (
    <TabStack>
      <Stack.Screen name="index" options={{ title: t('titles.squads') }} />
      <Stack.Screen name="[squadId]" options={squadOptions} />
      <Stack.Screen name="venue/[placeId]" options={venueOptions} />
    </TabStack>
  )
}
