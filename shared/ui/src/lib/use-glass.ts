import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'

export interface GlassState {
  /** iOS 26+ with the glass API present. */
  available: boolean
  /** The person turned on Reduce Transparency, so surfaces must be solid. */
  reduced: boolean
}

const glassAvailable = (): boolean =>
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

export const useGlass = (): GlassState => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'ios') return
    let active = true
    void AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (active) setReduced(enabled)
    })
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduced)
    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return { available: glassAvailable(), reduced }
}
