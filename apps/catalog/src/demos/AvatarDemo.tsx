import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Avatar } from '@roundup/ui'

import { Specimen } from '../components/Specimen.tsx'
import { PEOPLE } from '../fixtures.ts'

/** The pixel sizes an avatar comes in. */
const SIZES = [24, 28, 32, 40, 48, 64] as const

/** The six initials tints. */
const TINTS = [1, 2, 3, 4, 5, 6] as const

/**
 * Avatar at every size and tint, the way a stable tint follows an ID, and the initials of short names.
 * @returns The specimens.
 */
export const AvatarDemo = (): ReactElement => (
  <>
    <Specimen title="size=24 · 28 · 32 · 40 · 48 · 64">
      <View className="flex-row flex-wrap items-center gap-3">
        {SIZES.map((size) => (
          <Avatar key={size} name="Aarav Shah" size={size} />
        ))}
      </View>
    </Specimen>
    <Specimen title="tint=1 … 6">
      <View className="flex-row flex-wrap items-center gap-3">
        {TINTS.map((tint) => (
          <Avatar key={tint} name="Aarav Shah" size={48} tint={tint} />
        ))}
      </View>
    </Specimen>
    <Specimen
      note="With no tint the ID picks one, so a person looks the same everywhere."
      title="id=… (derived tint)"
    >
      <View className="flex-row flex-wrap items-center gap-3">
        {PEOPLE.map((person) => (
          <Avatar id={person.id ?? person.name} key={person.id} name={person.name} size={48} />
        ))}
      </View>
    </Specimen>
    <Specimen title="One-word name">
      <Avatar name="Meera" size={48} />
    </Specimen>
  </>
)
