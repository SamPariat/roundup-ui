import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { IAvatarProps } from './Avatar'

import { Avatar } from './Avatar'
import { Text } from './Text'

/** Whose avatar the header shows: a person or a squad. */
export type TIdentityAvatar = Pick<IAvatarProps, 'id' | 'name' | 'src'>

/** Props for IdentityHeader. */
export interface IIdentityHeaderProps {
  /** The name, shown as the screen's heading. */
  title: string
  /** One muted line under the name: a phone number, a member count. */
  subtitle?: string
  /** Whose avatar to draw. Defaults to the initials of `title`. */
  avatar?: TIdentityAvatar
}

/**
 * The top of a screen about one person or one squad: the avatar at 64 beside the name, as the
 * screen's heading, and one muted line under it. Both lines truncate to one line.
 * @returns The avatar and the two lines.
 */
export const IdentityHeader = ({ avatar, subtitle, title }: IIdentityHeaderProps): ReactElement => {
  const { id, name = title, src } = avatar ?? {}

  return (
    <View className="flex-row items-center gap-4">
      <Avatar
        name={name}
        size={64}
        {...(id === undefined ? {} : { id })}
        {...(src === undefined ? {} : { src })}
      />
      <View className="min-w-0 flex-1">
        <Text heading={1} numberOfLines={1} variant="heading">
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text numberOfLines={1} tone="muted" variant="body">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  )
}
