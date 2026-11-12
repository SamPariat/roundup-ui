import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { useCallback } from 'react'

import { useT } from '@roundup/i18n'

import type { IScreenProps } from '@/navigation/route-title'

import { TabStack } from '@/components/TabStack'
import { RouteTitle } from '@/navigation/route-title'

/**
 * The stack inside the Explore tab. A venue's page is titled from the title query parameter its
 * link carries (the venue's name, so it shows before the venue loads), and "Place" when opened
 * from a link without one.
 * @returns The stack of the Explore tab.
 */
export default function ExploreLayout(): ReactElement {
  const { t } = useT()

  const venueOptions = useCallback(
    ({ route }: IScreenProps): NativeStackNavigationOptions => ({
      title: RouteTitle.of(route.params) ?? t('titles.venue'),
    }),
    [t],
  )

  return (
    <TabStack>
      <Stack.Screen name="index" options={{ title: t('titles.explore') }} />
      <Stack.Screen name="[placeId]" options={venueOptions} />
    </TabStack>
  )
}
