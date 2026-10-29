import type { IconName } from '@roundup/ui'

/** One tab of the app. */
export interface TabItem {
  /** Route name and translation key suffix. */
  id: 'explore' | 'profile' | 'squads'
  /** Icon in the web and Android navs. */
  icon: IconName
  /** SF Symbol for the iOS system tab bar. */
  symbol: 'magnifyingglass' | 'person.2' | 'person.crop.circle'
  /** Route the tab opens. */
  href: '/explore' | '/profile' | '/squads'
}

/** The one list both layouts read, so the iOS system tab bar and the web/Android shell cannot drift. */
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

/**
 * Finds which tab a pathname belongs to, so nested routes keep their tab highlighted. Falls back to Squads.
 * @param pathname - The current URL path.
 * @returns The id of the tab whose route the path is under.
 */
export const tabIdForPath = (pathname: string): TabItem['id'] =>
  TAB_ITEMS.find((item) => pathname.startsWith(item.href))?.id ?? 'squads'
