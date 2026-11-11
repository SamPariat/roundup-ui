import { SquadTab } from '@/navigation/squad-tab'

describe('SquadTab', () => {
  it('reads the tab a link names', () => {
    expect(SquadTab.parse('favorites')).toBe('favorites')
    expect(SquadTab.parse('members')).toBe('members')
  })

  it.each([undefined, '', 'Favorites', 'photos', ['favorites']])(
    'falls back to the members tab for %p',
    (value) => {
      expect(SquadTab.parse(value)).toBe('members')
    },
  )

  it('leaves the default tab out of the URL', () => {
    expect(SquadTab.serialize('members')).toBeUndefined()
    expect(SquadTab.serialize('favorites')).toBe('favorites')
  })
})
