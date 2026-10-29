import type { ReactElement } from 'react'

import { View } from 'react-native'

import { useT } from '@roundup/i18n'

import type { NavItemData } from '../lib/nav-items.ts'
import type { Person } from '../lib/person.ts'

import { cn } from '../lib/cn.ts'
import { useDefaultNavItems } from '../lib/nav-items.ts'
import { Avatar } from './Avatar.tsx'
import { Icon } from './Icon.tsx'
import { Logo } from './Logo.tsx'
import { NavTab } from './NavTab.tsx'
import { Text } from './Text.tsx'

/** Props for SideNav. */
/** The person shown at the bottom of the rail. */
export interface NavUser extends Person {
  /** Phone number shown under the name. */
  phone?: string
}

/** Props for the user block. */
interface SideNavUserProps {
  /** The person to show. */
  user: NavUser
}

/** Props for SideNav. */
export interface SideNavProps {
  /** The destinations to show. Defaults to Squads, Explore and Profile. */
  items?: readonly NavItemData[]
  /** Defaults to 'squads'. */
  value?: string
  /** Called with the id of the tab that was pressed. */
  onChange?: (id: string) => void
  /** The signed-in person, pinned to the bottom. */
  user?: NavUser
}

/**
 * The signed-in person at the bottom of the rail: avatar, name and phone.
 * @returns The user block.
 */
const SideNavUser = ({ user }: SideNavUserProps): ReactElement => (
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
}: SideNavProps): ReactElement => {
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
              className={cn(
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
