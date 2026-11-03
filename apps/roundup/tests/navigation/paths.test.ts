import { paths } from '../../src/navigation/paths.ts'

describe('paths', () => {
  it.each([
    ['welcome', paths.welcome, '/'],
    ['signIn.phone', paths.signIn.phone, '/sign-in'],
    ['tabs.squads', paths.tabs.squads, '/squads'],
    ['tabs.explore', paths.tabs.explore, '/explore'],
    ['tabs.profile', paths.tabs.profile, '/profile'],
  ] as const)('%s is a plain string without a query', (_name, build, expected) => {
    expect(build()).toBe(expected)
  })

  it.each([
    ['welcome', paths.welcome, '/'],
    ['signIn.phone', paths.signIn.phone, '/sign-in'],
    ['tabs.squads', paths.tabs.squads, '/squads'],
    ['tabs.explore', paths.tabs.explore, '/explore'],
    ['tabs.profile', paths.tabs.profile, '/profile'],
  ] as const)('%s carries extra query parameters', (_name, build, expected) => {
    expect(build({ ref: 'invite' })).toEqual({ params: { ref: 'invite' }, pathname: expected })
  })

  it('builds the code path with the phone it needs', () => {
    expect(paths.signIn.code({ phone: '+919876543210' })).toEqual({
      params: { phone: '+919876543210' },
      pathname: '/sign-in/code',
    })
  })

  it('builds the code path with the phone and extra parameters', () => {
    expect(paths.signIn.code({ phone: '+919876543210', ref: 'invite' })).toEqual({
      params: { phone: '+919876543210', ref: 'invite' },
      pathname: '/sign-in/code',
    })
  })
})
