import type { Href } from 'expo-router'

import type { IconName } from './icons.ts'

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
