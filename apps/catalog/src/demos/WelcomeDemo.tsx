import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { Text, Welcome } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * Welcome as the app shows it, and with its copy replaced. Welcome fills its parent, so each is in a tall box.
 * @returns The specimens.
 */
export const WelcomeDemo = (): ReactElement => {
  const [started, setStarted] = useState(false)

  const start = useCallback(() => {
    setStarted(true)
  }, [])

  return (
    <>
      <Specimen note="Press Continue with phone." title="Default copy · onStart">
        <View className="h-176 overflow-hidden rounded-lg border border-border">
          <Welcome onStart={start} />
        </View>
        <Text tone="muted" variant="caption">
          {started ? 'Start was pressed' : 'Start not pressed'}
        </Text>
      </Specimen>
      <Specimen title="title · body · startLabel">
        <View className="h-176 overflow-hidden rounded-lg border border-border">
          <Welcome
            body="Plan the evening in one place."
            startLabel="Get started"
            title="Dinner, sorted."
          />
        </View>
      </Specimen>
    </>
  )
}
