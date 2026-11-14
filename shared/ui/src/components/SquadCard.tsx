import type { ReactElement } from 'react'

import { Pressable, View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { IPerson } from '../lib/person'

import { Avatar } from './Avatar'
import { AvatarGroup } from './AvatarGroup'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { Text } from './Text'

/** Props for SquadCard. */
export interface ISquadCardProps {
  /** Squad ID; picks the avatar tint. */
  id?: string
  /** The squad's name. */
  name: string
  /** Squad photo; initials are drawn without it. */
  avatarURL?: string
  /** The signed-in person's role in the squad. ADMIN adds an Admin badge. */
  role?: 'ADMIN' | 'MEMBER'
  /** Real member count when `members` is only a sample. Defaults to the sample length. */
  memberCount?: number
  /** A few members for the avatar stack. */
  members?: IPerson[]
  /** Called when the card is pressed; the card is a button. */
  onPress?: () => void
}

const NO_MEMBERS: NonNullable<ISquadCardProps['members']> = []

/**
 * A tappable card summarising a squad: name, avatar, stacked member avatars, count and role, spoken as one phrase.
 * @returns The card as a single button.
 */
export const SquadCard = ({
  avatarURL,
  id,
  members = NO_MEMBERS,
  memberCount,
  name,
  onPress,
  role,
}: ISquadCardProps): ReactElement => {
  const { t } = useT()
  const count = memberCount ?? members.length
  const countText = t('common.members', { count })
  const admin = t('squadCard.admin')

  const spoken =
    role === 'ADMIN'
      ? t('squadCard.spokenAdmin', { admin, members: countText, name })
      : t('squadCard.spoken', { members: countText, name })

  return (
    <Pressable
      accessibilityLabel={spoken}
      accessibilityRole="button"
      className="w-full gap-3 rounded-2xl border border-border bg-bg-raised p-4 hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring active:bg-bg-hover"
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
        {/* The count and the badge may wrap under each other on a narrow card rather than run out
            of it: a grid cell is as narrow as 280 points, and five faces take most of that. */}
        <View className="min-w-0 shrink flex-row flex-wrap items-center justify-end gap-2">
          <Text tone="muted" variant="caption">
            {countText}
          </Text>
          {role === 'ADMIN' ? <Badge tone="highlight">{admin}</Badge> : null}
        </View>
      </View>
    </Pressable>
  )
}
