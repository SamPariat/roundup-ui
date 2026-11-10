import { useCallback } from 'react'
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import type { IGlassStyle, TMotionStyle } from './useModalMotion'

import { useReducedMotion } from './useReducedMotion'

/** The menu's motion: the card's animated style, and the two ways to move it. */
export interface IMenuMotion {
  /** Grows and fades the card in or out from its top-right corner, under the ⋯ button. */
  style: TMotionStyle
  /** Grows the card open. */
  open: () => void
  /** Shrinks and fades the card out, then calls done. */
  close: (done: () => void) => void
}

/** How long opening takes, in milliseconds. */
const OPEN_MS = 200

/** Ease-out cubic, for arriving: quick to start, gentle to settle, with no overshoot. */
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1)

/** How long closing takes, in milliseconds: quicker than opening, as on iOS. */
const CLOSE_MS = 140

/** Ease-in cubic, for leaving. */
const EASE_IN = Easing.bezier(0.32, 0, 0.67, 0)

/** The scale the card grows from. */
const FROM_SCALE = 0.6

/** How far above its place the card starts, in points, so it seems to drop from the button. */
const FROM_Y = -8

/** How far the open card blurs what is behind it on the web, in pixels. */
const BLUR_PX = 40

/**
 * The opening and closing motion of a Menu, run on the UI thread by Reanimated, like an iOS context
 * menu: it grows from its top-right corner (under the ⋯ button) as it fades in, easing out with no
 * bounce, and shrinks back quickly as it fades out. With reduced motion only the fade remains. On the web the
 * card's blur grows with the motion, since Chrome keeps a stale blur under a fading parent.
 * @param web - Whether the card is drawn on the web, where its blur is part of the motion.
 * @returns The style and the open and close calls.
 */
export const useMenuMotion = (web: boolean): IMenuMotion => {
  const reduced = useReducedMotion()
  // 0 is closed and 1 is open.
  const progress = useSharedValue<number>(0)

  const open = useCallback((): void => {
    progress.set(0)
    progress.set(withTiming(1, { duration: OPEN_MS, easing: EASE_OUT }))
  }, [progress])

  const close = useCallback(
    (done: () => void): void => {
      progress.set(
        withTiming(0, { duration: CLOSE_MS, easing: EASE_IN }, (finished?: boolean): void => {
          'worklet'

          if (finished === true) scheduleOnRN(done)
        }),
      )
    },
    [progress],
  )

  const style = useAnimatedStyle((): IGlassStyle => {
    const value = progress.get()
    const scale = interpolate(value, [0, 1], [reduced ? 1 : FROM_SCALE, 1])
    const drop = interpolate(value, [0, 1], [reduced ? 0 : FROM_Y, 0])

    return {
      opacity: value,
      transform: [{ translateY: drop }, { scale }],
      transformOrigin: 'top right',
      ...(web ? { backdropFilter: `blur(${value * BLUR_PX}px) saturate(1.8)` } : {}),
    }
  })

  return { close, open, style }
}
