import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Button, Text, TopAppBar } from '@roundup/ui'

import { Preview } from '../components/Preview.tsx'
import { Specimen } from '../components/Specimen.tsx'

/**
 * TopAppBar as a top-level bar with the logo, with a back button, with actions and with a large title.
 * On a device with a notch the bar keeps clear of the status bar, so it sits lower than on the web.
 * @returns The specimens.
 */
export const TopAppBarDemo = (): ReactElement => {
  const [pressed, setPressed] = useState('Nothing yet')

  const back = useCallback(() => {
    setPressed('Back')
  }, [])

  const add = useCallback(() => {
    setPressed('Add')
  }, [])

  return (
    <>
      <Specimen title="logo=true">
        <Preview>
          <TopAppBar logo title="Squads" />
        </Preview>
      </Specimen>
      <Specimen title="back=true">
        <Preview>
          <TopAppBar back title="Friday Footy" />
        </Preview>
      </Specimen>
      <Specimen
        note="onBack shows the back button and is called when it is pressed."
        title="onBack · actions"
      >
        <Preview>
          <TopAppBar
            actions={
              <Button icon="plus" label="Add member" onPress={add} size="sm" variant="ghost" />
            }
            onBack={back}
            title="Friday Footy"
          />
        </Preview>
        <Text tone="muted" variant="caption">
          {`Pressed: ${pressed}`}
        </Text>
      </Specimen>
      <Specimen title="large=true">
        <Preview>
          <TopAppBar back large title="Explore venues" />
        </Preview>
      </Specimen>
    </>
  )
}
