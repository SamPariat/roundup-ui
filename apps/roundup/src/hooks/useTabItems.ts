import { usePathname } from 'expo-router'

import type { en } from '@roundup/i18n'
import type { TIconName } from '@roundup/ui'

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

/**
 * Tab helpers. Static methods only.
 */
export class TabHelper {
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
 * The tab the current route belongs to.
 * @returns The id of the active tab.
 */
export const useCurrentTab = (): ITabItem['id'] => TabHelper.idForPath(usePathname())
