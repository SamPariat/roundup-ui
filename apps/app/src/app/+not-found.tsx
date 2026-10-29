import type { ReactElement } from 'react'

import { Link, Stack } from 'expo-router'
import { View } from 'react-native'

import { EmptyState, Text } from '@roundup/ui'

export default function NotFoundScreen(): ReactElement {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center bg-bg px-4">
        <EmptyState
          action={
            <Link href="/squads">
              <Text tone="accent" variant="label">
                Go to your squads
              </Text>
            </Link>
          }
          art="search"
          body="That link doesn't lead anywhere. Check it and try again."
          title="Page not found"
        />
      </View>
    </>
  )
}
