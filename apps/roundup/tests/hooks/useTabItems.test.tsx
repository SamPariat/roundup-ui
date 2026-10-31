import { renderHook } from '@testing-library/react-native'

import { tabIdForPath, useTabItems } from '../../src/hooks/useTabItems.ts'

describe('tabIdForPath', () => {
  it.each([
    ['/squads', 'squads'],
    ['/squads/42/members', 'squads'],
    ['/explore', 'explore'],
    ['/profile', 'profile'],
    ['/unknown', 'squads'],
  ] as const)('maps %s to %s', (path, id) => {
    expect(tabIdForPath(path)).toBe(id)
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
