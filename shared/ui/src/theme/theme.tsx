import type { ReactElement, ReactNode } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Platform, useColorScheme } from 'react-native'

import { useHydrated } from '../lib/useHydrated'

/** What the person chose: follow the device, or force light or dark. */
export type TThemePreference = 'dark' | 'light' | 'system'

/** The two themes: Mocha is the dark one and Latte the light one. */
export type TThemeName = 'latte' | 'mocha'

/** What useTheme returns. */
export interface ITheme {
  /** Mocha is dark, Latte is light. */
  name: TThemeName
  /** The stored choice, which may be "system". */
  preference: TThemePreference
  /** False until the saved choice has been read (or storage failed), so a splash can wait for it. */
  loaded: boolean
  /** Saves a new choice and applies it at once. */
  setPreference: (preference: TThemePreference) => void
}

/** AsyncStorage key that holds the chosen preference. */
export const THEME_STORAGE_KEY = 'roundup.theme'

const PREFERENCES: ReadonlySet<unknown> = new Set(['system', 'light', 'dark'])

/**
 * Theme helpers. Static methods only.
 */
export class Theme {
  /**
   * Narrows a stored value to a known preference, so a corrupted entry is ignored.
   * @param value - The raw value read from storage.
   * @returns Whether the value is one of the three preferences.
   */
  static isPreference(value: unknown): value is TThemePreference {
    return PREFERENCES.has(value)
  }

  /**
   * Resolves a preference and the device appearance to a theme. Dark (Mocha) is the fallback while the device is unknown, which is also what static HTML is built with.
   * @param preference - The stored choice.
   * @param device - The device appearance, if known.
   * @returns The theme to apply.
   */
  static nameFor(
    preference: TThemePreference,
    device: 'dark' | 'light' | null | undefined,
  ): TThemeName {
    if (preference === 'light') return 'latte'
    if (preference === 'dark') return 'mocha'

    return device === 'light' ? 'latte' : 'mocha'
  }
}

const ThemeContext = createContext<ITheme | null>(null)

/** Props for ThemeProvider. */
interface IThemeProviderProps {
  /** The app to theme. */
  children: ReactNode
}

/**
 * Owns the theme: reads the saved preference, follows the device appearance, tells the stylesheet which theme to use, and saves changes.
 * @returns The provider wrapping its children.
 */
export const ThemeProvider = ({ children }: IThemeProviderProps): ReactElement => {
  const device = useColorScheme()

  const [preference, setPreference] = useState<TThemePreference>('system')
  const [loaded, setLoaded] = useState<boolean>(false)

  // The static HTML is rendered as Mocha; the device's real scheme is applied one pass later.
  const hydrated = useHydrated()
  const name = Theme.nameFor(preference, hydrated ? device : null)

  const choosePreference = useCallback((next: TThemePreference): void => {
    setPreference(next)

    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      // The choice still applies for this session.
    })
  }, [])

  const value = useMemo(
    (): ITheme => ({
      name,
      preference,
      loaded,
      setPreference: choosePreference,
    }),
    [name, preference, loaded, choosePreference],
  )

  useEffect(() => {
    let active = true

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (active && Theme.isPreference(stored)) setPreference(stored)
      })
      .catch(() => {
        // Storage can be unavailable (private windows); the device default still works.
      })
      .finally(() => {
        if (active) setLoaded(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const override = preference === 'system' ? 'unspecified' : preference

    // react-native-web has no Appearance.setColorScheme. On the web a manual choice is data-theme
    // on <html>, which theme.css gives priority over prefers-color-scheme, and color-scheme keeps
    // the browser's own controls (scrollbars, form fields) in step. Following the device is left
    // to the stylesheet. On native, setColorScheme changes what prefers-color-scheme means.
    if (Platform.OS === 'web') {
      const root = document.documentElement

      if (override === 'unspecified') {
        delete root.dataset['theme']
        root.style.colorScheme = ''
      } else {
        root.dataset['theme'] = override
        root.style.colorScheme = override
      }
    } else Appearance.setColorScheme(override)
  }, [preference])

  return <ThemeContext value={value}>{children}</ThemeContext>
}

/**
 * Reads the current theme and its setter. Throws outside a ThemeProvider so a missing provider fails loudly.
 * @returns The current theme name, preference and setter.
 */
export const useTheme = (): ITheme => {
  const theme = use(ThemeContext)

  if (theme === null) throw new Error('useTheme must be used inside <ThemeProvider>')

  return theme
}
