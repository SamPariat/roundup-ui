import type { Href } from 'expo-router'

import { useT } from '@roundup/i18n'

import type { IconName } from './icons.ts'

/** One destination in BottomNav or SideNav. */
export interface NavItemData {
  /** Stable ID passed to `onChange`. */
  id: string
  /** The translated tab text, also its accessible name. */
  label: string
  /** The tab icon. */
  icon: IconName
  /** With an href the item is a real link: an anchor on the web, a router push on native. */
  href?: Href
}

/** One of the built-in destinations. */
interface DefaultTab {
  /** Its icon. */
  icon: IconName
  /** Its ID, which doubles as the translation key suffix. */
  id: 'explore' | 'profile' | 'squads'
}

const DEFAULT_TABS = [
  { id: 'squads', icon: 'squads' },
  { id: 'explore', icon: 'explore' },
  { id: 'profile', icon: 'profile' },
] as const satisfies readonly DefaultTab[]

/**
 * The three main destinations with their translated labels, for navs that were given no items.
 * @returns The default items with labels in the active language.
 */
export const useDefaultNavItems = (): readonly NavItemData[] => {
  const { t } = useT()

  return DEFAULT_TABS.map(({ icon, id }) => ({ icon, id, label: t(`nav.tabs.${id}`) }))
}
