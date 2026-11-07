import type { Href } from 'expo-router'

import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { Paths } from '../navigation/paths'

/**
 * Goes back one screen. A page opened straight from a link has nothing behind it, so it goes to
 * the page given, the Profile tab by default, instead of doing nothing.
 * @param fallback - Where to go when there is nothing to go back to.
 * @returns The function that goes back.
 */
export const useBack = (fallback: Href = Paths.tabsProfile()): (() => void) => {
  const router = useRouter()

  return useCallback((): void => {
    if (!router.canGoBack()) {
      router.replace(fallback)

      return
    }

    router.back()
  }, [fallback, router])
}
