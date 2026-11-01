import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Avatar, Badge, Icon, List, ListRow, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * ListRow with each slot filled and each state: plain, pressable, destructive and busy.
 * @returns The specimens.
 */
export const ListRowDemo = (): ReactElement => {
  const [presses, setPresses] = useState(0)

  const press = useCallback(() => {
    setPresses((count) => count + 1)
  }, [])

  return (
    <>
      <Specimen note="No onPress: plain content, not a button." title="title only">
        <List>
          <ListRow title="Friday Footy" />
        </List>
      </Specimen>
      <Specimen title="subtitle">
        <List>
          <ListRow subtitle="12 members · last plan on Friday" title="Friday Footy" />
        </List>
      </Specimen>
      <Specimen title="leading=<Avatar> · trailing=<Badge>">
        <List>
          <ListRow
            leading={<Avatar name="Friday Footy" size={40} />}
            subtitle="12 members"
            title="Friday Footy"
            trailing={<Badge tone="accent">Admin</Badge>}
          />
        </List>
      </Specimen>
      <Specimen title="leading=<Icon> · chevron=true">
        <List>
          <ListRow
            chevron
            leading={<Icon decorative name="phone" tone="fg-muted" />}
            title="Phone number"
            trailing={<Text tone="muted">+91 98765 43210</Text>}
          />
        </List>
      </Specimen>
      <Specimen note="Press it: the row is a button." title="onPress">
        <List>
          <ListRow
            chevron
            onPress={press}
            subtitle={`Pressed ${String(presses)} times`}
            title="Notifications"
          />
        </List>
      </Specimen>
      <Specimen title="destructive=true">
        <List>
          <ListRow
            destructive
            leading={<Icon decorative name="logout" tone="danger" />}
            onPress={press}
            title="Sign out"
          />
        </List>
      </Specimen>
      <Specimen note="Busy: a request from this row is in flight." title="busy=true">
        <List>
          <ListRow busy chevron onPress={press} title="Syncing contacts" />
        </List>
      </Specimen>
    </>
  )
}
