import type { ReactElement } from 'react'

import { Pressable, View } from 'react-native'

import { Avatar } from '../Avatar/Avatar.tsx'
import { AvatarGroup } from '../AvatarGroup/AvatarGroup.tsx'
import { Badge } from '../Badge/Badge.tsx'
import { Icon } from '../Icon/Icon.tsx'
import { Text } from '../Text/Text.tsx'

export interface SquadCardProps {
  id?: string
  name: string
  avatarURL?: string
  role?: 'ADMIN' | 'MEMBER'
  memberCount?: number
  /** A few members for the avatar stack. */
  members?: { id?: string; name: string; src?: string }[]
  onPress?: () => void
}

const NO_MEMBERS: NonNullable<SquadCardProps['members']> = []

export const SquadCard = ({
  avatarURL,
  id,
  members = NO_MEMBERS,
  memberCount,
  name,
  onPress,
  role,
}: SquadCardProps): ReactElement => {
  const count = memberCount ?? members.length
  const countText = `${String(count)} ${count === 1 ? 'member' : 'members'}`
  const spoken = `${name}, ${countText}${role === 'ADMIN' ? ', Admin' : ''}`

  return (
    <Pressable
      accessibilityLabel={spoken}
      accessibilityRole="button"
      className="w-full gap-3 rounded-lg border border-border bg-bg-raised p-4 hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring active:bg-bg-hover"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          name={name}
          size={48}
          {...(id === undefined ? {} : { id })}
          {...(avatarURL === undefined ? {} : { src: avatarURL })}
        />
        <Text className="min-w-0 flex-1" numberOfLines={1} variant="heading">
          {name}
        </Text>
        <Icon decorative name="chevron" tone="fg-muted" />
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <AvatarGroup max={4} people={members} size={28} total={count} />
        <View className="flex-row items-center gap-2">
          <Text tone="muted" variant="caption">
            {countText}
          </Text>
          {role === 'ADMIN' ? <Badge tone="highlight">Admin</Badge> : null}
        </View>
      </View>
    </Pressable>
  )
}
