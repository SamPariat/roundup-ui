import { renderHook } from '@testing-library/react-native'

import { Tab, useTabItems } from '../../src/hooks/useTabItems'

describe('Tab.idForPath', () => {
  it.each([
    ['/squads', 'squads'],
    ['/squads/42/members', 'squads'],
    ['/explore', 'explore'],
    ['/profile', 'profile'],
    ['/unknown', 'squads'],
  ] as const)('maps %s to %s', (path, id) => {
    expect(Tab.idForPath(path)).toBe(id)
  })
})

describe('Tab.nestedTitleKey', () => {
  it.each([
    ['/profile/edit', 'titles.editProfile'],
    ['/profile/preferences', 'titles.preferences'],
    ['/profile', undefined],
    ['/squads', undefined],
  ] as const)('maps %s to %s', (path, key) => {
    expect(Tab.nestedTitleKey(path)).toBe(key)
  })
})

describe('useTabItems', () => {
  it('lists the destinations in order with their English labels and page titles', async () => {
    const { result } = await renderHook(() => useTabItems())

    expect(result.current.map((item) => [item.id, item.label, item.title, item.href])).toEqual([
      ['squads', 'Squads', 'Your squads', '/squads'],
      ['explore', 'Explore', 'Explore', '/explore'],
      ['profile', 'Profile', 'Profile', '/profile'],
    ])
  })
})
