import type { ReactElement } from 'react'

import { AvatarGroup } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { PEOPLE } from '../fixtures.ts'

/**
 * AvatarGroup with few people, many people, a real count larger than the sample, and larger avatars.
 * @returns The specimens.
 */
export const AvatarGroupDemo = (): ReactElement => (
  <>
    <Specimen title="2 people">
      <AvatarGroup people={PEOPLE.slice(0, 2)} />
    </Specimen>
    <Specimen title="max=4 (default) · 8 people">
      <AvatarGroup people={PEOPLE} />
    </Specimen>
    <Specimen title="max=6 · 8 people">
      <AvatarGroup max={6} people={PEOPLE} />
    </Specimen>
    <Specimen note="total is the real count when people is only a sample." title="total=24">
      <AvatarGroup people={PEOPLE.slice(0, 4)} total={24} />
    </Specimen>
    <Specimen title="size=48">
      <AvatarGroup people={PEOPLE} size={48} />
    </Specimen>
  </>
)
