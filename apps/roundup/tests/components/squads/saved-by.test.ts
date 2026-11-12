import type { IFavoriteRow, IFavoriteSaver } from '@roundup/core'

import { en, i18n } from '@roundup/i18n'

import { SavedBy } from '@/components/squads/saved-by'

/**
 * Builds a saver.
 * @param name - What the member is called; empty before profile setup.
 * @param isMe - Whether it is the signed-in person.
 * @returns A member of the squad who saved a place.
 */
const saver = (name: string, isMe = false): IFavoriteSaver => ({
  id: name === '' ? 'nameless' : name,
  isMe,
  name,
})

const t = i18n.t.bind(i18n)

describe('SavedBy.sentence', () => {
  it.each([
    [[], ''],
    [[saver('Meera')], 'Saved by Meera'],
    [[saver('Asha', true)], 'Saved by you'],
    [[saver('Meera'), saver('Kabir')], 'Saved by Meera and Kabir'],
    [[saver('Asha', true), saver('Meera')], 'Saved by you and Meera'],
    [[saver('Meera'), saver('Kabir'), saver('Zoya')], 'Saved by Meera and 2 others'],
    [[saver('Meera'), saver('Kabir'), saver('Zoya'), saver('Dev')], 'Saved by Meera and 3 others'],
    [[saver('')], 'Saved by a member'],
  ])('words %j as "%s"', (savers, sentence) => {
    expect(SavedBy.sentence(t, savers)).toBe(sentence)
  })

  it('says "other" for a single remaining saver', () => {
    expect(en.savedBy.many_one).toContain('{{count}} other')
  })
})

describe('SavedBy.line', () => {
  it('adds the day it was saved', () => {
    const row = { savedOn: '18 Oct', savers: [saver('Meera')] } as IFavoriteRow

    expect(SavedBy.line(t, row)).toBe('Saved by Meera · 18 Oct')
  })
})
