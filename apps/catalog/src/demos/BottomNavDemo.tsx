import type { ReactElement } from 'react'

import { useState } from 'react'

import { BottomNav, Text } from '@roundup/ui'

import { Preview } from '../components/Preview.tsx'
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
        <Preview>
          <BottomNav />
        </Preview>
      </Specimen>
      <Specimen title="value=explore">
        <Preview>
          <BottomNav value="explore" />
        </Preview>
      </Specimen>
      <Specimen note="Press a tab." title="Interactive">
        <Preview>
          <BottomNav onChange={setValue} value={value} />
        </Preview>
        <Text tone="muted" variant="caption">{`Current: ${value}`}</Text>
      </Specimen>
    </>
  )
}
