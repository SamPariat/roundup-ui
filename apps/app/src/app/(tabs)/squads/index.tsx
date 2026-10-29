import type { ReactElement } from 'react'

import { View } from 'react-native'

import { EmptyState } from '@roundup/ui'

export default function SquadsScreen(): ReactElement {
  return (
    <View className="flex-1 justify-center">
      <EmptyState art="squads" body="Make one and add your friends." title="No squads yet" />
    </View>
  )
}
