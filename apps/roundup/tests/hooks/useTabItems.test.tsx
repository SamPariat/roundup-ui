import { renderHook } from '@testing-library/react-native'

import { TabHelper, useTabItems } from '../../src/hooks/useTabItems'

describe('TabHelper.idForPath', () => {
  it.each([
    ['/squads', 'squads'],
    ['/squads/42/members', 'squads'],
    ['/explore', 'explore'],
    ['/profile', 'profile'],
    ['/unknown', 'squads'],
  ] as const)('maps %s to %s', (path, id) => {
    expect(TabHelper.idForPath(path)).toBe(id)
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
