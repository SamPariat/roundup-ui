import type { ReactElement } from 'react'

import { View } from 'react-native'

import type { NavItemData } from '../NavItem/nav-item.tsx'

import { Avatar } from '../Avatar/Avatar.tsx'
import { Icon } from '../Icon/Icon.tsx'
import { cn } from '../lib/cn.ts'
import { Logo } from '../Logo/Logo.tsx'
import { DEFAULT_NAV_ITEMS, NavPressable } from '../NavItem/nav-item.tsx'
import { Text } from '../Text/Text.tsx'

export interface SideNavProps {
  items?: readonly NavItemData[]
  /** Defaults to 'squads'. */
  value?: string
  onChange?: (id: string) => void
  /** The signed-in person, pinned to the bottom. */
  user?: { id?: string; name: string; phone?: string; src?: string }
}

/** Vertical navigation from 1024 wide up. */
export const SideNav = ({
  items = DEFAULT_NAV_ITEMS,
  onChange,
  user,
  value = 'squads',
}: SideNavProps): ReactElement => (
  <View
    className="w-sidenav gap-1 border-r border-border bg-bg-sunken px-3 pt-6 pb-4"
    role="navigation"
  >
    <View className="px-3 pb-6">
      <Logo size={28} />
    </View>
    <View accessibilityLabel="Sidebar" className="gap-1" role="tablist">
      {items.map((item) => {
        const active = item.id === value
        return (
          <NavPressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            aria-selected={active}
            className={cn(
              'h-[44px] w-full flex-row items-center gap-3 rounded-md px-3 hover:bg-bg-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
              active && 'bg-accent-soft',
            )}
            href={item.href}
            key={item.id}
            onPress={() => onChange?.(item.id)}
          >
            <Icon decorative name={item.icon} tone={active ? 'accent' : 'fg-muted'} />
            <Text tone={active ? 'fg' : 'muted'} variant="label">
              {item.label}
            </Text>
          </NavPressable>
        )
      })}
    </View>
    <View className="flex-1" />
    {user === undefined ? null : (
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
    )}
  </View>
)
