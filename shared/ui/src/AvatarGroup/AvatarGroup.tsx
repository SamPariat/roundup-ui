import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { AvatarSize } from '../Avatar/Avatar.tsx'

import { Avatar } from '../Avatar/Avatar.tsx'
import { Text } from '../Text/Text.tsx'

export interface AvatarGroupProps {
  people: { id?: string; name: string; src?: string }[]
  /** Real member count when `people` is only a sample. */
  total?: number
  max?: number
  size?: AvatarSize
}

export const AvatarGroup = ({
  max = 4,
  people,
  size = 32,
  total,
}: AvatarGroupProps): ReactElement => {
  const shown = people.slice(0, max)
  const count = total ?? people.length
  const rest = count - shown.length

  return (
    <View
      accessibilityLabel={`${String(count)} members`}
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
