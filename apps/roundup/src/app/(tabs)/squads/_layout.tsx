import type { NativeStackNavigationOptions } from 'expo-router'
import type { ReactElement } from 'react'

import { Stack } from 'expo-router'
import { useCallback } from 'react'

import { useT } from '@roundup/i18n'

import { TabStack } from '@/components/TabStack'

/** What a screen's options function is given: here, only its route and that route's params. */
interface IScreenProps {
  /** The screen's route. */
  route: {
    /** The route's params: the path segments and the query. */
    params?: object | undefined
  }
}

/**
 * Squads route helpers. Static methods only.
 */
class SquadRoute {
  /**
   * Reads the title a link passed in the query (Paths.squad(id, name)).
   * @param params - The path segments and query the router parsed for the squad's page.
   * @returns The title, or undefined when the link carried none.
   */
  static title(params: object | undefined): string | undefined {
    const value: unknown = params !== undefined && 'title' in params ? params.title : undefined

    return typeof value === 'string' && value !== '' ? value : undefined
  }
}

/**
 * The stack inside the Squads tab. A squad's page is titled from the title query parameter its
 * link carries (the squad's name, so it shows before the squad loads), and "Squad" when opened
 * from a link without one.
 * @returns The stack of the Squads tab.
 */
export default function SquadsLayout(): ReactElement {
  const { t } = useT()

  const squadOptions = useCallback(
    ({ route }: IScreenProps): NativeStackNavigationOptions => ({
      title: SquadRoute.title(route.params) ?? t('titles.squad'),
    }),
    [t],
  )

  return (
    <TabStack>
      <Stack.Screen name="index" options={{ title: t('titles.squads') }} />
      <Stack.Screen name="[squadId]" options={squadOptions} />
    </TabStack>
  )
}
