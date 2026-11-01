import type { ReactElement } from 'react'

import { Button, EmptyState } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * EmptyState with each illustration, with and without a body and an action.
 * @returns The specimens.
 */
export const EmptyStateDemo = (): ReactElement => (
  <>
    <Specimen title="art=squads (default) · body · action">
      <EmptyState
        action={<Button icon="plus">Create a squad</Button>}
        body="Squads you create or join show up here."
        title="No squads yet"
      />
    </Specimen>
    <Specimen title="art=search">
      <EmptyState
        art="search"
        body="Try a different name or a wider area."
        title="No venues found"
      />
    </Specimen>
    <Specimen title="art=favorites · action">
      <EmptyState
        action={<Button variant="secondary">Explore venues</Button>}
        art="favorites"
        body="Tap the bookmark on a venue to keep it here."
        title="Nothing saved"
      />
    </Specimen>
    <Specimen title="title only">
      <EmptyState title="Nothing here" />
    </Specimen>
  </>
)
