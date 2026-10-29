import type { IconName } from '@roundup/ui'

export interface TabItem {
  id: 'explore' | 'profile' | 'squads'
  label: string
  icon: IconName
  /** SF Symbol for the iOS system tab bar. */
  symbol: 'magnifyingglass' | 'person.2' | 'person.crop.circle'
  href: '/explore' | '/profile' | '/squads'
  title: string
}

// The one list both layouts read, so the iOS system tab bar and the web/Android shell cannot drift.
export const TAB_ITEMS: readonly TabItem[] = [
  {
    id: 'squads',
    label: 'Squads',
    icon: 'squads',
    symbol: 'person.2',
    href: '/squads',
    title: 'Squads',
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: 'explore',
    symbol: 'magnifyingglass',
    href: '/explore',
    title: 'Explore',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'profile',
    symbol: 'person.crop.circle',
    href: '/profile',
    title: 'Profile',
  },
]

export const tabIdForPath = (pathname: string): TabItem['id'] =>
  TAB_ITEMS.find((item) => pathname.startsWith(item.href))?.id ?? 'squads'
