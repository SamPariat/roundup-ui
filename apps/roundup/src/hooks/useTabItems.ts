import { usePathname } from 'expo-router'

import type { en } from '@roundup/i18n'
import type { TIconName } from '@roundup/ui'

import { useT } from '@roundup/i18n'

import { Paths } from '@/navigation/paths'

/** The i18n key of a tab's name in the nav. */
type TLabelKey = `nav.tabs.${keyof typeof en.nav.tabs}`

/** One tab of the app. */
export interface ITabItem {
  /** Route name. */
  id: 'explore' | 'profile' | 'squads'
  /** Icon in the web and Android navs. */
  icon: TIconName
  /** SF Symbol for the iOS system tab bar. */
  symbol: 'magnifyingglass' | 'person.2' | 'person.crop.circle'
  /** Route the tab opens. */
  href: '/explore' | '/profile' | '/squads'
  /** The translated name, for the nav and the accessibility label. */
  label: string
}

/** A tab before it is translated: the exact key of its name, never built from its id. */
interface ITabDefinition extends Omit<ITabItem, 'label'> {
  /** The key of its name in the nav. */
  labelKey: TLabelKey
}

/** The one list every layout reads, so the iOS system tab bar and the web/Android shell cannot drift. */
const TAB_DEFINITIONS: readonly ITabDefinition[] = [
  {
    id: 'squads',
    icon: 'squads',
    symbol: 'person.2',
    href: Paths.tabsSquads(),
    labelKey: 'nav.tabs.squads',
  },
  {
    id: 'explore',
    icon: 'explore',
    symbol: 'magnifyingglass',
    href: Paths.tabsExplore(),
    labelKey: 'nav.tabs.explore',
  },
  {
    id: 'profile',
    icon: 'profile',
    symbol: 'person.crop.circle',
    href: Paths.tabsProfile(),
    labelKey: 'nav.tabs.profile',
  },
]

/** The same tabs keyed by id, so one can be read directly rather than searched for. */
const TAB_BY_ID = Object.fromEntries(TAB_DEFINITIONS.map((tab) => [tab.id, tab])) as Record<
  ITabItem['id'],
  ITabDefinition
>

/**
 * Tab helpers. Static methods only.
 */
export class Tab {
  /**
   * Finds which tab a pathname belongs to, so nested routes keep their tab highlighted. Falls back to Squads.
   * @param pathname - The current URL path.
   * @returns The id of the tab whose route the path is under.
   */
  static idForPath(pathname: string): ITabItem['id'] {
    return TAB_DEFINITIONS.find((item) => pathname.startsWith(item.href))?.id ?? 'squads'
  }
}

/**
 * The tabs in display order with their names in the current language.
 * @returns One item per destination.
 */
export const useTabItems = (): readonly ITabItem[] => {
  const { t } = useT()

  return TAB_DEFINITIONS.map(({ labelKey, ...item }) => ({ ...item, label: t(labelKey) }))
}

/**
 * One tab, looked up directly by its id, with its name in the current language.
 * @param id - The tab's route name.
 * @returns Its icon, route and translated name.
 */
export const useTabItem = (id: ITabItem['id']): ITabItem => {
  const { t } = useT()
  const { labelKey, ...item } = TAB_BY_ID[id]

  return { ...item, label: t(labelKey) }
}

/**
 * The tab the current route belongs to.
 * @returns The id of the active tab.
 */
export const useCurrentTab = (): ITabItem['id'] => Tab.idForPath(usePathname())
