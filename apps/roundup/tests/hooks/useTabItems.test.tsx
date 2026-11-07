import { renderHook } from '@testing-library/react-native'

import { Tab, useTabItems } from '@/hooks/useTabItems'

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

describe('useTabItems', () => {
  it('lists the destinations in order with their English labels', async () => {
    const { result } = await renderHook(() => useTabItems())

    expect(result.current.map((item) => [item.id, item.label, item.href])).toEqual([
      ['squads', 'Squads', '/squads'],
      ['explore', 'Explore', '/explore'],
      ['profile', 'Profile', '/profile'],
    ])
  })
})
