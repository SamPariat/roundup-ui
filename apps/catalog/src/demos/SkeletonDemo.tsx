import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Avatar, Button, List, ListRow, Skeleton } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { PEOPLE } from '../fixtures.ts'

/**
 * Skeleton as one row, several rows and a venue card, then a list that swaps between its skeleton and its rows.
 * @returns The specimens.
 */
export const SkeletonDemo = (): ReactElement => {
  const [loading, setLoading] = useState(true)

  const toggle = useCallback(() => {
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
      <Specimen title="variant=card">
        <Skeleton variant="card" />
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
        <Button onPress={toggle} size="sm" variant="secondary">
          {loading ? 'Finish loading' : 'Load again'}
        </Button>
      </Specimen>
    </>
  )
}
