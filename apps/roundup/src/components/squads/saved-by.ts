import type { IFavoriteRow, IFavoriteSaver } from '@roundup/core'
import type { useT } from '@roundup/i18n'

/** The translator `useT` gives, with its keys checked. */
type TTranslate = ReturnType<typeof useT>['t']

/**
 * The words that say who saved a favorite. Static methods only.
 */
export class SavedBy {
  /**
   * Says who saved a favorite: "Saved by you", "Saved by Meera", "Saved by Meera and Kabir" or
   * "Saved by Meera and 2 others". The signed-in person reads as "you" and a member who has no
   * name yet as "a member".
   * @param t - The translator.
   * @param savers - The members who saved it, the most recent first.
   * @returns The sentence, or an empty string when nobody is left who saved it.
   */
  static sentence(t: TTranslate, savers: readonly IFavoriteSaver[]): string {
    const [first, second, ...rest] = savers.map((saver) => SavedBy.nameOf(t, saver))

    if (first === undefined) return ''

    if (second === undefined) return t('savedBy.one', { name: first })

    if (rest.length === 0) return t('savedBy.two', { first, second })

    return t('savedBy.many', { count: savers.length - 1, name: first })
  }

  /**
   * Says who saved a favorite and when, as a row's subtitle: "Saved by Meera · 18 Oct".
   * @param t - The translator.
   * @param row - The favorite whose savers and date the line reads.
   * @returns The subtitle.
   */
  static line(t: TTranslate, row: IFavoriteRow): string {
    return t('savedBy.line', { date: row.savedOn, savedBy: SavedBy.sentence(t, row.savers) })
  }

  /**
   * Names one saver.
   * @param t - The translator.
   * @param saver - The member who saved it.
   * @returns "you", their name, or "a member" while they have none.
   */
  private static nameOf(t: TTranslate, saver: IFavoriteSaver): string {
    if (saver.isMe) return t('savedBy.you')

    return saver.name.trim() === '' ? t('savedBy.someone') : saver.name
  }
}
