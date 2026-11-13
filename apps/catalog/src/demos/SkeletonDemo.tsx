import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Avatar, Button, List, ListRow, Skeleton } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'
import { PEOPLE } from '@/fixtures'

/**
 * Skeleton as one row, several rows, flush item rows, a venue card, the search field, the whole venue page and the whole squad page, a squad's events tab and the card beside it, an event's page and the aside beside it, and a pinned bar, then a list that swaps between its skeleton and its rows.
 * @returns The specimens.
 */
export const SkeletonDemo = (): ReactElement => {
  const [loading, setLoading] = useState<boolean>(true)

  const handleToggle = useCallback((): void => {
    setLoading((current) => !current)
  }, [])

  return (
    <>
      <Specimen title="variant=row (default) · count=1">
        <Skeleton />
      </Specimen>
      <Specimen title="variant=row · count=3">
        <Skeleton count={3} />
      </Specimen>
      <Specimen title="variant=item · count=3">
        <Skeleton count={3} variant="item" />
      </Specimen>
      <Specimen title="variant=card">
        <Skeleton variant="card" />
      </Specimen>
      <Specimen title="variant=search">
        <Skeleton variant="search" />
      </Specimen>
      <Specimen title="variant=venue">
        <Skeleton variant="venue" />
      </Specimen>
      <Specimen title="variant=squad">
        <Skeleton variant="squad" />
      </Specimen>
      <Specimen title="variant=events">
        <Skeleton variant="events" />
      </Specimen>
      <Specimen title="variant=answer">
        <Skeleton variant="answer" />
      </Specimen>
      <Specimen title="variant=event">
        <Skeleton variant="event" />
      </Specimen>
      <Specimen title="variant=rsvp">
        <Skeleton variant="rsvp" />
      </Specimen>
      <Specimen title="variant=bar">
        <Skeleton variant="bar" />
      </Specimen>
      <Specimen
        note="The loading state of a screen: placeholders first, then the rows."
        title="Interactive"
      >
        {loading ? (
          <Skeleton count={3} />
        ) : (
          <List>
            {PEOPLE.slice(0, 3).map((person) => (
              <ListRow
                key={person.id}
                leading={<Avatar name={person.name} size={32} />}
                title={person.name}
              />
            ))}
          </List>
        )}
        <Button onPress={handleToggle} size="sm" variant="secondary">
          {loading ? 'Finish loading' : 'Load again'}
        </Button>
      </Specimen>
    </>
  )
}
