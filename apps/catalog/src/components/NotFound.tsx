import type { ReactElement } from 'react'

import { Link } from 'expo-router'
import { View } from 'react-native'

import { EmptyState, Text } from '@roundup/ui'

/**
 * What both the 404 route and a component page with an unknown slug show: an empty state with a link to the index.
 * @returns The empty state, centred.
 */
export const NotFound = (): ReactElement => (
  <View className="flex-1 items-center justify-center bg-bg px-4">
    <EmptyState
      action={
        <Link href="/">
          <Text tone="accent" variant="label">
            See all components
          </Text>
        </Link>
      }
      art="search"
      body="No component in the catalog has that name."
      title="Component not found"
    />
  </View>
)
