import type { Href } from 'expo-router'

import { useT } from '@roundup/i18n'

import type { IconName } from './icons.ts'

export interface NavItemData {
  id: string
  label: string
  icon: IconName
  /** With an href the item is a real link: an anchor on the web, a router push on native. */
  href?: Href
}

const DEFAULT_TABS = [
  { id: 'squads', icon: 'squads' },
  { id: 'explore', icon: 'explore' },
  { id: 'profile', icon: 'profile' },
] as const satisfies readonly { icon: IconName; id: 'explore' | 'profile' | 'squads' }[]

/** The three main destinations with their translated labels, for navs that were given no items. */
export const useDefaultNavItems = (): readonly NavItemData[] => {
  const { t } = useT()

  return DEFAULT_TABS.map(({ icon, id }) => ({ icon, id, label: t(`nav.tabs.${id}`) }))
}
