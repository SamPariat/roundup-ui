import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { INavItemData } from '../lib/nav-items'
import type { IPerson } from '../lib/person'

import { ClassHelper } from '../lib/class-helper'
import { useDefaultNavItems } from '../lib/nav-items'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { Logo } from './Logo'
import { NavTab } from './NavTab'
import { Text } from './Text'

/** Props for SideNav. */
/** The person shown at the bottom of the rail. */
export interface INavUser extends IPerson {
  /** Phone number shown under the name. */
  phone?: string
}

/** Props for the user block. */
interface ISideNavUserProps {
  /** The person to show. */
  user: INavUser
}

/** Props for SideNav. */
export interface ISideNavProps {
  /** The destinations to show. Defaults to Squads, Explore and Profile. */
  items?: readonly INavItemData[]
  /** Defaults to 'squads'. */
  value?: string
  /** Called with the id of the tab that was pressed. */
  onChange?: (id: string) => void
  /** The signed-in person, pinned to the bottom. */
  user?: INavUser
}

/**
 * The signed-in person at the bottom of the rail: avatar, name and phone.
 * @returns The user block.
 */
const SideNavUser = ({ user }: ISideNavUserProps): ReactElement => (
  <View className="flex-row items-center gap-3 border-t border-border px-3 pt-3">
    <Avatar
      name={user.name}
      size={32}
      {...(user.id === undefined ? {} : { id: user.id })}
      {...(user.src === undefined ? {} : { src: user.src })}
    />
    <View className="min-w-0 flex-1">
      <Text numberOfLines={1} variant="label">
        {user.name}
      </Text>
      {user.phone === undefined ? null : (
        <Text tone="muted" variant="caption">
          {user.phone}
        </Text>
      )}
    </View>
  </View>
)

/**
 * Vertical navigation from 1024 wide up.
 * @returns The side rail, a navigation tablist.
 */
export const SideNav = ({
  items,
  onChange,
  user,
  value = 'squads',
}: ISideNavProps): ReactElement => {
  const { t } = useT()
  const defaults = useDefaultNavItems()
  const shown = items ?? defaults

  return (
    <View
      className="w-62 gap-1 border-r border-border bg-bg-sunken px-3 pt-6 pb-4"
      role="navigation"
    >
      <View className="px-3 pb-6">
        <Logo size={28} />
      </View>
      <View accessibilityLabel={t('nav.sidebar')} className="gap-1" role="tablist">
        {shown.map((item) => {
          const active = item.id === value

          return (
            <NavTab
              active={active}
              className={ClassHelper.cn(
                'h-11 w-full flex-row items-center gap-3 rounded-xl px-3 hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
                active && 'bg-accent-soft',
              )}
              item={item}
              key={item.id}
              onChange={onChange}
            >
              <Icon decorative name={item.icon} tone={active ? 'accent' : 'fg-muted'} />
              <Text tone={active ? 'fg' : 'muted'} variant="label">
                {item.label}
              </Text>
            </NavTab>
          )
        })}
      </View>
      <View className="flex-1" />
      {user === undefined ? null : <SideNavUser user={user} />}
    </View>
  )
}
