import type { ReactElement } from 'react'

import { useState } from 'react'
import { View } from 'react-native'

import { BottomNav, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * BottomNav with its default destinations, the active tab changing as you press. On a phone with a
 * gesture bar the bar grows by the bottom inset.
 * @returns The specimens.
 */
export const BottomNavDemo = (): ReactElement => {
  const [value, setValue] = useState('squads')

  return (
    <>
      <Specimen title="value=squads (default)">
        <View className="overflow-hidden rounded-lg">
          <BottomNav />
        </View>
      </Specimen>
      <Specimen title="value=explore">
        <View className="overflow-hidden rounded-lg">
          <BottomNav value="explore" />
        </View>
      </Specimen>
      <Specimen note="Press a tab." title="Interactive">
        <View className="overflow-hidden rounded-lg">
          <BottomNav onChange={setValue} value={value} />
        </View>
        <Text tone="muted" variant="caption">{`Current: ${value}`}</Text>
      </Specimen>
    </>
  )
}
