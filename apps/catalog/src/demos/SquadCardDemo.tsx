import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { SquadCard, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { BOOK_CLUB, FRIDAY_FOOTY, PEOPLE } from '../fixtures.ts'

/**
 * SquadCard as admin and member, without members, with a real count beyond the sample, and pressable.
 * @returns The specimens.
 */
export const SquadCardDemo = (): ReactElement => {
  const [opened, setOpened] = useState('Nothing yet')

  const open = useCallback(() => {
    setOpened('Opened Friday Footy')
  }, [])

  return (
    <>
      <Specimen note="ADMIN adds an Admin badge." title="role=ADMIN">
        <SquadCard {...FRIDAY_FOOTY} />
      </Specimen>
      <Specimen title="role=MEMBER">
        <SquadCard {...BOOK_CLUB} />
      </Specimen>
      <Specimen title="memberCount=24 · 4 members drawn">
        <SquadCard id="s4" memberCount={24} members={PEOPLE.slice(0, 4)} name="Office Lunch" />
      </Specimen>
      <Specimen title="no members">
        <SquadCard id="s5" name="Just Me" />
      </Specimen>
      <Specimen title="Long name">
        <SquadCard
          id="s6"
          members={PEOPLE.slice(0, 3)}
          name="The Saturday Morning Five-a-side Football Regulars"
          role="ADMIN"
        />
      </Specimen>
      <Specimen note="Press the card: it is a button." title="onPress">
        <SquadCard
          id="s1"
          members={PEOPLE.slice(0, 5)}
          name="Friday Footy"
          onPress={open}
          role="ADMIN"
        />
        <Text tone="muted" variant="caption">
          {opened}
        </Text>
      </Specimen>
    </>
  )
}
