import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { VenueCard } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { CLOSED_VENUE, OPEN_VENUE } from '../fixtures.ts'

/**
 * VenueCard open and closed, with the least it can show, with price unknown, and with a save button that works.
 * @returns The specimens.
 */
export const VenueCardDemo = (): ReactElement => {
  const [saved, setSaved] = useState(false)

  const toggle = useCallback(() => {
    setSaved((current) => !current)
  }, [])

  return (
    <>
      <Specimen title="isOpen=true · everything shown">
        <VenueCard {...OPEN_VENUE} />
      </Specimen>
      <Specimen title="isOpen=false">
        <VenueCard {...CLOSED_VENUE} />
      </Specimen>
      <Specimen note="Without a photo a pattern is drawn." title="name only">
        <VenueCard name="Café Noir" />
      </Specimen>
      <Specimen note="Level 0 is unknown and shows nothing." title="priceLevel=0 · no types">
        <VenueCard
          address="3 Lavelle Road"
          name="Mystery Bistro"
          priceLevel={0}
          rating={4.1}
          reviews={87}
        />
      </Specimen>
      <Specimen note="Press the bookmark." title="saved · onSave">
        <VenueCard
          address="12 Church Street, Bengaluru"
          isOpen
          name="Blue Tokai Coffee Roasters"
          onSave={toggle}
          priceLevel={2}
          rating={4.6}
          reviews={1280}
          saved={saved}
          types={['Cafe']}
        />
      </Specimen>
    </>
  )
}
