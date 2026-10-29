import type { ReactElement } from 'react'

import { View } from 'react-native'

import { EmptyState } from '@roundup/ui'

export default function ExploreScreen(): ReactElement {
  return (
    <View className="flex-1 justify-center">
      <EmptyState
        art="search"
        body="Bars, cafes and restaurants near you will show up here."
        title="Nothing to explore yet"
      />
    </View>
  )
}
