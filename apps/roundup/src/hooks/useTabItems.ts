import { useGlobalSearchParams, usePathname } from 'expo-router'

import type { en } from '@roundup/i18n'
import type { TIconName } from '@roundup/ui'

import { useSquad } from '@roundup/core'
import { useT } from '@roundup/i18n'

import { Paths } from '../navigation/paths'

/** The i18n key of a tab's name in the nav. */
type TLabelKey = `nav.tabs.${keyof typeof en.nav.tabs}`

/** The i18n key of a tab's page title. */
type TTitleKey = `titles.${keyof typeof en.titles}`

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
  /** The translated page title, shown in the top app bar and the page header. */
  title: string
}

/** A tab before it is translated: the exact keys of its name and title, never built from its id. */
interface ITabDefinition extends Omit<ITabItem, 'label' | 'title'> {
  /** The key of its name in the nav. */
  labelKey: TLabelKey
  /** The key of its page title. */
  titleKey: TTitleKey
}

/** The one list every layout reads, so the iOS system tab bar and the web/Android shell cannot drift. */
const TAB_DEFINITIONS: readonly ITabDefinition[] = [
  {
    id: 'squads',
    icon: 'squads',
    symbol: 'person.2',
    href: Paths.tabsSquads(),
    labelKey: 'nav.tabs.squads',
    titleKey: 'titles.squads',
  },
  {
    id: 'explore',
    icon: 'explore',
    symbol: 'magnifyingglass',
    href: Paths.tabsExplore(),
    labelKey: 'nav.tabs.explore',
    titleKey: 'titles.explore',
  },
  {
    id: 'profile',
    icon: 'profile',
    symbol: 'person.crop.circle',
    href: Paths.tabsProfile(),
    labelKey: 'nav.tabs.profile',
    titleKey: 'titles.profile',
  },
]

/** The route parameters of a squad's page. */
interface ISquadRouteParams extends Record<string, string | undefined> {
  /** The squad's ID, from the [squadId] segment; undefined on every other route. */
  squadId?: string
}

/** The same tabs keyed by id, so one can be read directly rather than searched for. */
const TAB_BY_ID = Object.fromEntries(TAB_DEFINITIONS.map((tab) => [tab.id, tab])) as Record<
  ITabItem['id'],
  ITabDefinition
>

/** A screen pushed inside a tab, which has its own title and a back button. */
interface INestedDefinition {
  /** The route of the screen. */
  href: string
  /** The key of its page title. */
  titleKey: TTitleKey
}

/** The screens pushed inside the tabs, so the shell can title them and offer a way back. */
const NESTED_DEFINITIONS: readonly INestedDefinition[] = [
  { href: Paths.profileEdit(), titleKey: 'titles.editProfile' },
  { href: Paths.profilePreferences(), titleKey: 'titles.preferences' },
]

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

  /**
   * Finds the title key of a screen pushed inside a tab.
   * @param pathname - The current URL path.
   * @returns The key of the screen's title, or undefined on a tab's own page.
   */
  static nestedTitleKey(pathname: string): TTitleKey | undefined {
    return NESTED_DEFINITIONS.find((item) => item.href === pathname)?.titleKey
  }
}

/**
 * The tabs in display order with their names and page titles in the current language.
 * @returns One item per destination.
 */
export const useTabItems = (): readonly ITabItem[] => {
  const { t } = useT()

  return TAB_DEFINITIONS.map(({ labelKey, titleKey, ...item }) => ({
    ...item,
    label: t(labelKey),
    title: t(titleKey),
  }))
}

/**
 * One tab, looked up directly by its id, with its name and page title in the current language.
 * @param id - The tab's route name.
 * @returns Its icon, route, translated name and page title.
 */
export const useTabItem = (id: ITabItem['id']): ITabItem => {
  const { t } = useT()
  const { labelKey, titleKey, ...item } = TAB_BY_ID[id]

  return { ...item, label: t(labelKey), title: t(titleKey) }
}

/**
 * The tab the current route belongs to.
 * @returns The id of the active tab.
 */
export const useCurrentTab = (): ITabItem['id'] => Tab.idForPath(usePathname())

/**
 * The title of the screen pushed inside a tab, when the current route is one. A squad's page is
 * titled with the squad's name, and "Squad" until the name loads.
 * @returns The translated title, or undefined on a tab's own page.
 */
export const useNestedTitle = (): string | undefined => {
  const { t } = useT()
  const pathname = usePathname()
  // The router reads the squad's ID from its [squadId] segment; no other route has that segment.
  const { squadId } = useGlobalSearchParams<ISquadRouteParams>()
  const { squad } = useSquad(squadId)
  const key = Tab.nestedTitleKey(pathname)

  if (squadId !== undefined) return squad?.name ?? t('titles.squad')

  return key === undefined ? undefined : t(key)
}
