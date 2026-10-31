import { renderHook } from '@testing-library/react-native'

import { breakpointFor, useBreakpoint } from '../../src/lib/useBreakpoint.ts'

describe('breakpointFor', () => {
  it.each([
    [360, 'phone'],
    [466, 'phone'],
    [626, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [890, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1440, 'desktop'],
  ] as const)('maps %i wide to %s', (width, expected) => {
    expect(breakpointFor(width)).toBe(expected)
  })
})

describe('useBreakpoint', () => {
  it('reads the current window width', async () => {
    const { result } = await renderHook(() => useBreakpoint())

    expect(result.current.width).toBeGreaterThan(0)
  })
})
