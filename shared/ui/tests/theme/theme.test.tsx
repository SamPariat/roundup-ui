import type { ReactNode } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { THEME_STORAGE_KEY, themeNameFor, ThemeProvider, useTheme } from '../../src/theme/theme.tsx'

/** Props of the hook test wrapper. */
interface WrapperProps {
  /** The hook's host. */
  children: ReactNode
}

/**
 * Wraps a hook under test in the ThemeProvider.
 * @returns The provider around the children.
 */
const wrapper = ({ children }: WrapperProps) => <ThemeProvider>{children}</ThemeProvider>

describe('themeNameFor', () => {
  it('follows the device when the preference is system', () => {
    expect(themeNameFor('system', 'light')).toBe('latte')
    expect(themeNameFor('system', 'dark')).toBe('mocha')
  })

  it('defaults to Mocha when the device does not say', () => {
    expect(themeNameFor('system', null)).toBe('mocha')
  })

  it('lets an explicit choice win over the device', () => {
    expect(themeNameFor('light', 'dark')).toBe('latte')
    expect(themeNameFor('dark', 'light')).toBe('mocha')
  })
})

describe('ThemeProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('saves the chosen preference on the device', async () => {
    const { result } = await renderHook(() => useTheme(), { wrapper })

    await act(() => {
      result.current.setPreference('light')
    })

    expect(result.current.name).toBe('latte')

    await waitFor(async () => {
      expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })
  })

  it('reports loaded once the saved preference has been read', async () => {
    const { result } = await renderHook(() => useTheme(), { wrapper })

    await waitFor(() => {
      expect(result.current.loaded).toBe(true)
    })
  })

  it('restores the saved preference on start', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark')

    const { result } = await renderHook(() => useTheme(), { wrapper })

    await waitFor(() => {
      expect(result.current.preference).toBe('dark')
    })
  })

  it('refuses to be used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())

    await expect(renderHook(() => useTheme())).rejects.toThrow('ThemeProvider')
  })
})
