import type { IconName } from '@roundup/ui'

export interface TabItem {
  id: 'explore' | 'profile' | 'squads'
  icon: IconName
  /** SF Symbol for the iOS system tab bar. */
  symbol: 'magnifyingglass' | 'person.2' | 'person.crop.circle'
  href: '/explore' | '/profile' | '/squads'
}

// The one list both layouts read, so the iOS system tab bar and the web/Android shell cannot drift.
export const TAB_ITEMS: readonly TabItem[] = [
  {
    id: 'squads',
    icon: 'squads',
    symbol: 'person.2',
    href: '/squads',
  },
  {
    id: 'explore',
    icon: 'explore',
    symbol: 'magnifyingglass',
    href: '/explore',
  },
  {
    id: 'profile',
    icon: 'profile',
    symbol: 'person.crop.circle',
    href: '/profile',
  },
]

export const tabIdForPath = (pathname: string): TabItem['id'] =>
  TAB_ITEMS.find((item) => pathname.startsWith(item.href))?.id ?? 'squads'
