import { Paths } from '@/navigation/paths'

describe('Paths', () => {
  it('returns the plain path when there is no query', () => {
    expect(Paths.welcome()).toBe('/')
    expect(Paths.signInPhone()).toBe('/sign-in')
    expect(Paths.signInName()).toBe('/sign-in/name')
    expect(Paths.tabsSquads()).toBe('/squads')
    expect(Paths.tabsExplore()).toBe('/explore')
    expect(Paths.tabsProfile()).toBe('/profile')
    expect(Paths.profileEdit()).toBe('/profile/edit')
    expect(Paths.profilePreferences()).toBe('/profile/preferences')
  })

  it('carries extra query parameters', () => {
    const query = { ref: 'invite' }

    expect(Paths.welcome(query)).toEqual({ params: query, pathname: '/' })
    expect(Paths.signInPhone(query)).toEqual({ params: query, pathname: '/sign-in' })
    expect(Paths.signInName(query)).toEqual({ params: query, pathname: '/sign-in/name' })
    expect(Paths.tabsSquads(query)).toEqual({ params: query, pathname: '/squads' })
    expect(Paths.tabsExplore(query)).toEqual({ params: query, pathname: '/explore' })
    expect(Paths.tabsProfile(query)).toEqual({ params: query, pathname: '/profile' })
    expect(Paths.profileEdit(query)).toEqual({ params: query, pathname: '/profile/edit' })

    expect(Paths.profilePreferences(query)).toEqual({
      params: query,
      pathname: '/profile/preferences',
    })
  })

  it('builds the code path with the phone it needs', () => {
    expect(Paths.signInCode({ phone: '+919876543210' })).toEqual({
      params: { phone: '+919876543210' },
      pathname: '/sign-in/code',
    })
  })

  it('builds the code path with the phone and extra parameters', () => {
    expect(Paths.signInCode({ phone: '+919876543210', ref: 'invite' })).toEqual({
      params: { phone: '+919876543210', ref: 'invite' },
      pathname: '/sign-in/code',
    })
  })

  it('builds the squad path with the squad it opens', () => {
    expect(Paths.squad('s1')).toEqual({
      params: { squadId: 's1' },
      pathname: '/squads/[squadId]',
    })
  })

  it('carries the squad name as the title query parameter', () => {
    expect(Paths.squad('s1', { title: 'Weekend Crew' })).toEqual({
      params: { squadId: 's1', title: 'Weekend Crew' },
      pathname: '/squads/[squadId]',
    })
  })

  it('opens a squad on its Favorites tab, and leaves the default tab out', () => {
    expect(Paths.squad('s1', { tab: 'favorites', title: 'Weekend Crew' })).toEqual({
      params: { squadId: 's1', tab: 'favorites', title: 'Weekend Crew' },
      pathname: '/squads/[squadId]',
    })

    expect(Paths.squad('s1', { tab: 'members' })).toEqual({
      params: { squadId: 's1' },
      pathname: '/squads/[squadId]',
    })
  })

  it('carries the Explore search as its query parameters', () => {
    expect(Paths.tabsExplore({ q: 'brew', radius: '10', type: 'cafe' })).toEqual({
      params: { q: 'brew', radius: '10', type: 'cafe' },
      pathname: '/explore',
    })
  })

  it('builds the venue path with the place it opens and its name as the title', () => {
    expect(Paths.venue('v1')).toEqual({
      params: { placeId: 'v1' },
      pathname: '/explore/[placeId]',
    })

    expect(Paths.venue('v1', 'Skyline Bar')).toEqual({
      params: { placeId: 'v1', title: 'Skyline Bar' },
      pathname: '/explore/[placeId]',
    })
  })

  it('builds the squad venue path, under the Squads tab, the same way', () => {
    expect(Paths.squadVenue('v1', 'Skyline Bar')).toEqual({
      params: { placeId: 'v1', title: 'Skyline Bar' },
      pathname: '/squads/venue/[placeId]',
    })

    expect(Paths.squadVenue('v1')).toEqual({
      params: { placeId: 'v1' },
      pathname: '/squads/venue/[placeId]',
    })
  })

  it('builds the event path, under the Squads tab, with its name as the title', () => {
    expect(Paths.squadEvent('e1', 'Saturday night out')).toEqual({
      params: { eventId: 'e1', title: 'Saturday night out' },
      pathname: '/squads/event/[eventId]',
    })

    expect(Paths.squadEvent('e1')).toEqual({
      params: { eventId: 'e1' },
      pathname: '/squads/event/[eventId]',
    })
  })

  it('opens a squad on its Events tab', () => {
    expect(Paths.squad('s1', { tab: 'events' })).toEqual({
      params: { squadId: 's1', tab: 'events' },
      pathname: '/squads/[squadId]',
    })
  })
})
