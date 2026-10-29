import type { ReactElement, ReactNode } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { VariableContextProvider } from 'nativewind'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { Appearance, Platform, useColorScheme } from 'react-native'

import type { Roles, ThemeName } from '@roundup/tokens'

import { shadows, themes } from '@roundup/tokens'

import { useHydrated } from '../lib/use-hydrated.ts'

export type ThemePreference = 'dark' | 'light' | 'system'

export interface Theme {
  /** Mocha is dark, Latte is light. */
  name: ThemeName
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** Role colours for the few places that cannot use a class: svg fills, spinners, glass tints. */
  roles: Roles
  /** boxShadow strings by token name, for floating surfaces. */
  shadow: Readonly<Record<string, string>>
}

export const THEME_STORAGE_KEY = 'roundup.theme'

const PREFERENCES: ReadonlySet<unknown> = new Set(['system', 'light', 'dark'])

const isPreference = (value: unknown): value is ThemePreference => PREFERENCES.has(value)

export const themeNameFor = (
  preference: ThemePreference,
  device: 'dark' | 'light' | null | undefined,
): ThemeName => {
  if (preference === 'light') return 'latte'
  if (preference === 'dark') return 'mocha'

  return device === 'light' ? 'latte' : 'mocha'
}

export const cssVariablesFor = (name: ThemeName): Record<string, string> =>
  Object.fromEntries(
    Object.entries(themes[name]).map(([role, value]) => [`--color-${role}`, value]),
  )

const ThemeContext = createContext<null | Theme>(null)

export const ThemeProvider = ({ children }: { children: ReactNode }): ReactElement => {
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

export const useTheme = (): Theme => {
  const theme = use(ThemeContext)

  if (theme === null) throw new Error('useTheme must be used inside <ThemeProvider>')

  return theme
}
