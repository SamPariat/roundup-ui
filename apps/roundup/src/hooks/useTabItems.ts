import { usePathname } from 'expo-router'

import type { IconName } from '@roundup/ui'

import { useT } from '@roundup/i18n'

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
  /** The translated name, for the nav, the title and the accessibility label. */
  label: string
}

/** A tab before its label is translated. */
type TabDefinition = Omit<TabItem, 'label'>

/** The one list every layout reads, so the iOS system tab bar and the web/Android shell cannot drift. */
const TAB_DEFINITIONS: readonly TabDefinition[] = [
  { id: 'squads', icon: 'squads', symbol: 'person.2', href: '/squads' },
  { id: 'explore', icon: 'explore', symbol: 'magnifyingglass', href: '/explore' },
  { id: 'profile', icon: 'profile', symbol: 'person.crop.circle', href: '/profile' },
]

/**
 * Finds which tab a pathname belongs to, so nested routes keep their tab highlighted. Falls back to Squads.
 * @param pathname - The current URL path.
 * @returns The id of the tab whose route the path is under.
 */
export const tabIdForPath = (pathname: string): TabItem['id'] =>
  TAB_DEFINITIONS.find((item) => pathname.startsWith(item.href))?.id ?? 'squads'

/**
 * The tabs in display order with their labels in the current language.
 * @returns One item per destination.
 */
export const useTabItems = (): readonly TabItem[] => {
  const { t } = useT()

  return TAB_DEFINITIONS.map((item) => ({ ...item, label: t(`nav.tabs.${item.id}`) }))
}

/**
 * The tab the current route belongs to.
 * @returns The id of the active tab.
 */
export const useCurrentTab = (): TabItem['id'] => tabIdForPath(usePathname())
