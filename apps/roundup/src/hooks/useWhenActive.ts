import type { AppStateStatus } from 'react-native'

import { useCallback, useEffect } from 'react'
import { AppState } from 'react-native'

/**
 * Runs a callback each time the app comes back to the foreground: on a phone, after the person
 * visited Settings, and on web, after they returned to the tab.
 * @param onActive - Called when the app becomes active.
 */
export const useWhenActive = (onActive: () => void): void => {
  const handleChange = useCallback(
    (state: AppStateStatus): void => {
      if (state === 'active') onActive()
    },
    [onActive],
  )

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleChange)

    return () => {
      subscription.remove()
    }
  }, [handleChange])
}
