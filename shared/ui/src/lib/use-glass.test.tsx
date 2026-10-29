import { renderHook, waitFor } from '@testing-library/react-native'
import { AccessibilityInfo, Platform } from 'react-native'

import { useGlass } from './use-glass.ts'

jest.mock('expo-glass-effect', () => ({
  isLiquidGlassAvailable: jest.fn(() => true),
  isGlassEffectAPIAvailable: jest.fn(() => true),
}))

describe('useGlass', () => {
  const originalOs = Platform.OS

  afterEach(() => {
    Platform.OS = originalOs
    jest.restoreAllMocks()
  })

  it('reports glass as available on iOS when the system supports it', async () => {
    Platform.OS = 'ios'
    jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(false)

    const { result } = await renderHook(() => useGlass())

    expect(result.current).toEqual({ available: true, reduced: false })
  })

  it('reports reduced transparency so surfaces fall back to solid colours', async () => {
    Platform.OS = 'ios'
    jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled').mockResolvedValue(true)

    const { result } = await renderHook(() => useGlass())

    await waitFor(() => {
      expect(result.current.reduced).toBe(true)
    })
  })

  it('is never available off iOS', async () => {
    Platform.OS = 'android'

    const { result } = await renderHook(() => useGlass())

    expect(result.current.available).toBe(false)
  })
})
