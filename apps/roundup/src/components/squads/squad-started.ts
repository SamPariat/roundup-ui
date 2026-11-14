import type { ISquadInfo } from '@roundup/core'
import type { useT } from '@roundup/i18n'

/** The translator `useT` gives, with its keys checked. */
type TTranslate = ReturnType<typeof useT>['t']

/**
 * The words that say who started a squad and when. Static methods only.
 */
export class SquadStarted {
  /**
   * Says who started a squad and on which day: "Started by you on 3rd Oct 2026", "Started by
   * Aarav on 3rd Oct 2026", or "Started on 3rd Oct 2026" once the creator has left or while they
   * have no name.
   * @param t - The translator.
   * @param squad - The squad whose creator and day the line reads.
   * @returns The sentence for the squad header, after its member count.
   */
  static line(
    t: TTranslate,
    squad: Pick<ISquadInfo, 'createdByMe' | 'createdByName' | 'createdOn'>,
  ): string {
    const date = squad.createdOn

    if (squad.createdByMe) return t('screens.squad.startedByYou', { date })

    if (squad.createdByName === undefined) return t('screens.squad.started', { date })

    return t('screens.squad.startedBy', { date, name: squad.createdByName })
  }
}
