import { Paths } from '../../src/navigation/paths'

describe('Paths', () => {
  it('returns the plain path when there is no query', () => {
    expect(Paths.welcome()).toBe('/')
    expect(Paths.signInPhone()).toBe('/sign-in')
    expect(Paths.signInName()).toBe('/sign-in/name')
    expect(Paths.tabsSquads()).toBe('/squads')
    expect(Paths.tabsExplore()).toBe('/explore')
    expect(Paths.tabsProfile()).toBe('/profile')
  })

  it('carries extra query parameters', () => {
    const query = { ref: 'invite' }

    expect(Paths.welcome(query)).toEqual({ params: query, pathname: '/' })
    expect(Paths.signInPhone(query)).toEqual({ params: query, pathname: '/sign-in' })
    expect(Paths.signInName(query)).toEqual({ params: query, pathname: '/sign-in/name' })
    expect(Paths.tabsSquads(query)).toEqual({ params: query, pathname: '/squads' })
    expect(Paths.tabsExplore(query)).toEqual({ params: query, pathname: '/explore' })
    expect(Paths.tabsProfile(query)).toEqual({ params: query, pathname: '/profile' })
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
})
