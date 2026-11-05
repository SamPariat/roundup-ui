import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { Paths } from '../navigation/paths'

/**
 * Goes back one screen. A page opened straight from a link has nothing behind it, so it goes to
 * the Profile tab instead of doing nothing.
 * @returns The function that goes back.
 */
export const useBack = (): (() => void) => {
  const router = useRouter()

  return useCallback(() => {
    if (router.canGoBack()) router.back()
    else router.replace(Paths.tabsProfile())
  }, [router])
}
