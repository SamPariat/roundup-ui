import type { ReactElement } from 'react'

import { Link, Stack } from 'expo-router'
import { View } from 'react-native'

import { useT } from '@roundup/i18n'
import { EmptyState, Text } from '@roundup/ui'

/**
 * Expo Router's fallback for any URL that matches no route, with a link back to the squads.
 * @returns The window title and an empty state with the link.
 */
export default function NotFoundScreen(): ReactElement {
  const { t } = useT()

  return (
    <>
      <Stack.Screen options={{ title: t('screens.notFound.windowTitle') }} />
      <View className="flex-1 items-center justify-center bg-bg px-4">
        <EmptyState
          action={
            <Link href="/squads">
              <Text tone="accent" variant="label">
                {t('screens.notFound.action')}
              </Text>
            </Link>
          }
          art="search"
          body={t('screens.notFound.body')}
          title={t('screens.notFound.title')}
        />
      </View>
    </>
  )
}
