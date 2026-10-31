import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * True while the system asks apps to cut motion. Skeletons stop pulsing and spinners slow down.
 * @returns Whether motion should be reduced; false until the setting has been read.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let active = true

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduced(enabled)
    })

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)

    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return reduced
}
