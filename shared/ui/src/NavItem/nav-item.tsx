import type { Href } from 'expo-router'
import type { ReactElement, ReactNode } from 'react'
import type { PressableProps } from 'react-native'

import { Link } from 'expo-router'
import { Pressable } from 'react-native'

import type { IconName } from '../Icon/icons.ts'

export interface NavItemData {
  id: string
  label: string
  icon: IconName
  /** With an href the item is a real link: an anchor on the web, a router push on native. */
  href?: Href
}

export const DEFAULT_NAV_ITEMS: readonly NavItemData[] = [
  { id: 'squads', label: 'Squads', icon: 'squads' },
  { id: 'explore', label: 'Explore', icon: 'explore' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
]

type NavPressableProps = Omit<PressableProps, 'children'> & {
  children: ReactNode
  href?: Href | undefined
}

// Items with an href go through the router's Link so the web gets real anchors.
export const NavPressable = ({ children, href, ...props }: NavPressableProps): ReactElement => {
  const pressable = <Pressable {...props}>{children}</Pressable>
  if (href === undefined) return pressable
  // Link would stamp role="link" on the child; keep the tab role the tablist expects. The
  // browser still gets a real anchor, which is what makes middle-click and copy-link work.
  return (
    <Link asChild href={href} role="tab">
      {pressable}
    </Link>
  )
}
