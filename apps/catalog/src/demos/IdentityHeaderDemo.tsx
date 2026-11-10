import type { ReactElement } from 'react'

import { IdentityHeader } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * IdentityHeader for a person, a squad and a name too long for the line.
 * @returns The specimens.
 */
export const IdentityHeaderDemo = (): ReactElement => (
  <>
    <Specimen title="person">
      <IdentityHeader
        avatar={{ id: 'u-aarav', name: 'Aarav Shah' }}
        subtitle="+91 98765 43210"
        title="Aarav Shah"
      />
    </Specimen>
    <Specimen title="squad">
      <IdentityHeader
        avatar={{ id: 's-friday', name: 'Friday crew' }}
        subtitle="12 members"
        title="Friday crew"
      />
    </Specimen>
    <Specimen note="Both lines truncate to one line." title="long name">
      <IdentityHeader
        avatar={{ id: 's-football', name: 'Sunday football' }}
        subtitle="14 members"
        title="Sunday football at the old college ground"
      />
    </Specimen>
  </>
)
