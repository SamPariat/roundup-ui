import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Text, Welcome } from '@roundup/ui'

import { Preview } from '../components/Preview.tsx'
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
        <Preview className="min-h-176 border border-border">
          <Welcome onStart={start} />
        </Preview>
        <Text tone="muted" variant="caption">
          {started ? 'Start was pressed' : 'Start not pressed'}
        </Text>
      </Specimen>
      <Specimen title="title · body · startLabel">
        <Preview className="min-h-176 border border-border">
          <Welcome
            body="Plan the evening in one place."
            startLabel="Get started"
            title="Dinner, sorted."
          />
        </Preview>
      </Specimen>
    </>
  )
}
