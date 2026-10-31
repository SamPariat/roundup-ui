import type { ReactElement, ReactNode } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { VariableContextProvider } from 'nativewind'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Platform, useColorScheme } from 'react-native'

import type { Roles, ThemeName } from '@roundup/tokens'

import { shadows, themes } from '@roundup/tokens'

import { useHydrated } from '../lib/useHydrated.ts'

/** What the person chose: follow the device, or force light or dark. */
export type ThemePreference = 'dark' | 'light' | 'system'

/** What useTheme returns. */
export interface Theme {
  /** Mocha is dark, Latte is light. */
  name: ThemeName
  /** The stored choice, which may be "system". */
  preference: ThemePreference
  /** Saves a new choice and applies it at once. */
  setPreference: (preference: ThemePreference) => void
  /** Role colours for the few places that cannot use a class: svg fills, spinners, glass tints. */
  roles: Roles
  /** boxShadow strings by token name, for floating surfaces. */
  shadow: Readonly<Record<string, string>>
}

/** AsyncStorage key that holds the chosen preference. */
export const THEME_STORAGE_KEY = 'roundup.theme'

const PREFERENCES: ReadonlySet<unknown> = new Set(['system', 'light', 'dark'])

/**
 * Narrows a stored value to a known preference, so a corrupted entry is ignored.
 * @param value - The raw value read from storage.
 * @returns Whether the value is one of the three preferences.
 */
const isPreference = (value: unknown): value is ThemePreference => PREFERENCES.has(value)

/**
 * Resolves a preference and the device appearance to a theme. Dark (Mocha) is the fallback while the device is unknown, which is also what static HTML is built with.
 * @param preference - The stored choice.
 * @param device - The device appearance, if known.
 * @returns The theme to apply.
 */
export const themeNameFor = (
  preference: ThemePreference,
  device: 'dark' | 'light' | null | undefined,
): ThemeName => {
  if (preference === 'light') return 'latte'
  if (preference === 'dark') return 'mocha'

  return device === 'light' ? 'latte' : 'mocha'
}

/**
 * Lists a theme's roles as `--color-*` variables, the form NativeWind's variable context takes.
 * @param name - The theme to read.
 * @returns The variable name to colour map.
 */
export const cssVariablesFor = (name: ThemeName): Record<string, string> =>
  Object.fromEntries(
    Object.entries(themes[name]).map(([role, value]) => [`--color-${role}`, value]),
  )

const ThemeContext = createContext<null | Theme>(null)

/** Props for ThemeProvider. */
interface ThemeProviderProps {
  /** The app to theme. */
  children: ReactNode
}

/**
 * Owns the theme: reads the saved preference, follows the device appearance, publishes role colours through context and CSS variables, and saves changes.
 * @returns The provider wrapping its children.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps): ReactElement => {
  const device = useColorScheme()
  const [preference, setPreference] = useState<ThemePreference>('system')

  useEffect(() => {
    let active = true

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) setPreference(stored)
      })
      .catch(() => {
        // Storage can be unavailable (private windows); the device default still works.
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const override = preference === 'system' ? 'unspecified' : preference

    // react-native-web has no Appearance.setColorScheme; the browser takes color-scheme from the document.
    if (Platform.OS === 'web')
      document.documentElement.style.colorScheme = override === 'unspecified' ? '' : override
    else Appearance.setColorScheme(override)
  }, [preference])

  const choosePreference = useCallback((next: ThemePreference) => {
    setPreference(next)

    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {
      // The choice still applies for this session.
    })
  }, [])

  // The static HTML is rendered as Mocha; the device's real scheme is applied one pass later.
  const hydrated = useHydrated()
  const name = themeNameFor(preference, hydrated ? device : null)

  const value = useMemo<Theme>(
    () => ({
      name,
      preference,
      setPreference: choosePreference,
      roles: themes[name],
      shadow: shadows[name],
    }),
    [name, preference, choosePreference],
  )

  // On the web, following the device is left to the stylesheet's prefers-color-scheme rule, so the
  // static HTML already matches a dark or light browser. Everything else sets the variables here.
  const variables = useMemo(
    () => (Platform.OS === 'web' && preference === 'system' ? {} : cssVariablesFor(name)),
    [name, preference],
  )

  return (
    <ThemeContext value={value}>
      <VariableContextProvider value={variables}>{children}</VariableContextProvider>
    </ThemeContext>
  )
}

/**
 * Reads the current theme and its setter. Throws outside a ThemeProvider so a missing provider fails loudly.
 * @returns The current theme, its roles and its setter.
 */
export const useTheme = (): Theme => {
  const theme = use(ThemeContext)

  if (theme === null) throw new Error('useTheme must be used inside <ThemeProvider>')

  return theme
}
