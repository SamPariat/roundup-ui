import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { Person } from '../lib/person.ts'
import type { AvatarSize } from './Avatar.tsx'

import { Avatar } from './Avatar.tsx'
import { Text } from './Text.tsx'

/** Props for AvatarGroup. */
export interface AvatarGroupProps {
  /** The people to draw, in order; only the first `max` are shown. */
  people: Person[]
  /** Real member count when `people` is only a sample. */
  total?: number
  /** How many avatars to draw before collapsing the rest into a +N chip. Defaults to 4. */
  max?: number
  /** Avatar size for every member. Defaults to 32. */
  size?: AvatarSize
}

/**
 * An overlapping row of member avatars with a +N chip for the overflow, announced as one image that says how many members there are.
 * @returns The stacked avatars.
 */
export const AvatarGroup = ({
  max = 4,
  people,
  size = 32,
  total,
}: AvatarGroupProps): ReactElement => {
  const { t } = useT()
  const shown = people.slice(0, max)
  const count = total ?? people.length
  const rest = count - shown.length

  return (
    <View
      accessibilityLabel={t('common.members', { count })}
      accessible
      className="flex-row items-center"
      role="img"
    >
      {shown.map((person, index) => (
        <View
          className={
            index === 0
              ? 'rounded-full border-2 border-bg-raised'
              : '-ml-2 rounded-full border-2 border-bg-raised'
          }
          key={person.id ?? `${person.name}-${String(index)}`}
        >
          <Avatar
            name={person.name}
            size={size}
            {...(person.id === undefined ? {} : { id: person.id })}
            {...(person.src === undefined ? {} : { src: person.src })}
          />
        </View>
      ))}
      {rest > 0 ? (
        <View className="-ml-2 rounded-full border-2 border-bg-raised bg-bg-hover px-2 py-1">
          <Text aria-hidden variant="caption">{`+${String(rest)}`}</Text>
        </View>
      ) : null}
    </View>
  )
}
