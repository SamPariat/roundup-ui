import type { ReactElement } from 'react'

import { useCallback, useState } from 'react'

import { Avatar, Button, PageHeader, Text } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'

/**
 * PageHeader with a title only, a subtitle, a back link, a leading avatar and actions.
 * @returns The specimens.
 */
export const PageHeaderDemo = (): ReactElement => {
  const [went, setWent] = useState('Nowhere yet')

  const back = useCallback(() => {
    setWent('Back to Squads')
  }, [])

  return (
    <>
      <Specimen title="title only">
        <PageHeader title="Squads" />
      </Specimen>
      <Specimen title="subtitle">
        <PageHeader subtitle="12 members" title="Friday Footy" />
      </Specimen>
      <Specimen note="Press the back link." title="back · onBack">
        <PageHeader back="Squads" onBack={back} title="Friday Footy" />
        <Text tone="muted" variant="caption">
          {went}
        </Text>
      </Specimen>
      <Specimen title="leading=<Avatar> · actions=<Button>">
        <PageHeader
          actions={<Button icon="plus">Add member</Button>}
          leading={<Avatar name="Friday Footy" size={48} />}
          subtitle="12 members"
          title="Friday Footy"
        />
      </Specimen>
    </>
  )
}
