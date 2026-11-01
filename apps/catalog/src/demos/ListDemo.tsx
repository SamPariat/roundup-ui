import type { ReactElement } from 'react'

import { Avatar, Badge, List, ListRow } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { PEOPLE } from '../fixtures.ts'

/**
 * List around a few rows, and around one, to show where the dividers go.
 * @returns The specimens.
 */
export const ListDemo = (): ReactElement => (
  <>
    <Specimen title="Several rows">
      <List>
        {PEOPLE.slice(0, 4).map((person) => (
          <ListRow
            key={person.id}
            leading={<Avatar name={person.name} size={32} />}
            subtitle="Member"
            title={person.name}
          />
        ))}
      </List>
    </Specimen>
    <Specimen note="No divider above the first row." title="One row">
      <List>
        <ListRow title="Only one" />
      </List>
    </Specimen>
    <Specimen title="Mixed rows">
      <List>
        <ListRow chevron title="Notifications" />
        <ListRow
          subtitle="Aarav Shah"
          title="Owner"
          trailing={<Badge tone="accent">Admin</Badge>}
        />
        <ListRow destructive title="Delete squad" />
      </List>
    </Specimen>
  </>
)
