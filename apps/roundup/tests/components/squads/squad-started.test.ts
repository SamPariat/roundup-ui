import { i18n } from '@roundup/i18n'

import { SquadStarted } from '@/components/squads/squad-started'

const t = i18n.t.bind(i18n)

describe('SquadStarted.line', () => {
  it('says you started it', () => {
    expect(SquadStarted.line(t, { createdByMe: true, createdOn: '3rd Oct 2026' })).toBe(
      'Started by you on 3rd Oct 2026',
    )
  })

  it('names who started it', () => {
    expect(
      SquadStarted.line(t, {
        createdByMe: false,
        createdByName: 'Aarav',
        createdOn: '3rd Oct 2026',
      }),
    ).toBe('Started by Aarav on 3rd Oct 2026')
  })

  it('gives only the day once the creator has left or has no name', () => {
    expect(SquadStarted.line(t, { createdByMe: false, createdOn: '3rd Oct 2026' })).toBe(
      'Started on 3rd Oct 2026',
    )
  })
})
