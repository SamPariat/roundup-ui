import type { ReactElement } from 'react'

import { useState } from 'react'

import type { TabItem } from '@roundup/ui'

import { Tabs, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/** Tabs without counts. */
const PLAIN: TabItem[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
]

/** Tabs with counts. */
const COUNTED: TabItem[] = [
  { id: 'members', label: 'Members', count: 12 },
  { id: 'plans', label: 'Plans', count: 3 },
  { id: 'bills', label: 'Bills', count: 0 },
]

/**
 * Tabs with two and three segments, with counts, and one that switches content.
 * @returns The specimens.
 */
export const TabsDemo = (): ReactElement => {
  const [plain, setPlain] = useState('upcoming')
  const [counted, setCounted] = useState('members')

  return (
    <>
      <Specimen title="items=2 · no counts">
        <Tabs items={PLAIN} value="upcoming" />
      </Specimen>
      <Specimen title="items=3 · count">
        <Tabs items={COUNTED} value="plans" />
      </Specimen>
      <Specimen note="Press a segment." title="Interactive">
        <Tabs items={PLAIN} onChange={setPlain} value={plain} />
        <Text tone="muted">{`Showing ${plain} plans`}</Text>
      </Specimen>
      <Specimen title="Interactive · counts">
        <Tabs items={COUNTED} onChange={setCounted} value={counted} />
        <Text tone="muted">{`Showing ${counted}`}</Text>
      </Specimen>
    </>
  )
}
