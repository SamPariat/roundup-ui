/** The two views of a squad on a phone. */
export type TSquadTab = 'favorites' | 'members'

/**
 * The squad page's tab as the `tab` query parameter spells it. Static methods only.
 */
export class SquadTab {
  /** The tab shown when the link names none, or names one that does not exist; it is left out of the URL. */
  static readonly defaultTab: TSquadTab = 'members'

  /**
   * Reads the tab out of a route parameter.
   * @param value - The raw `tab` parameter, if the link has one.
   * @returns The tab it names, or the default.
   */
  static parse(value: string | string[] | undefined): TSquadTab {
    return value === 'favorites' ? 'favorites' : SquadTab.defaultTab
  }

  /**
   * Writes the tab as a parameter.
   * @param tab - The tab to show.
   * @returns The parameter's value, or undefined for the default, which the URL leaves out.
   */
  static serialize(tab: TSquadTab): string | undefined {
    return tab === SquadTab.defaultTab ? undefined : tab
  }
}
