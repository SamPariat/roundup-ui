import type { ViewStyle } from 'react-native'

import { useCallback, useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { useReducedMotion } from './useReducedMotion'

/** A Reanimated style for an Animated.View. */
export type TMotionStyle = ReturnType<typeof useAnimatedStyle<ViewStyle>>

/** What the modal needs to move: whether it is up, the animated styles and the close request. */
export interface IModalMotion {
  /** Whether the native modal host is showing; it stays up until the closing motion ends. */
  mounted: boolean
  /** The backdrop's fade. */
  backdrop: TMotionStyle
  /** The sheet's slide (app) or the card's fade and scale (web). */
  panel: TMotionStyle
  /** Asks to close: unless busy, plays the closing motion, then calls onClose. */
  requestClose: () => void
}

/** Options for useModalMotion. */
export interface IModalMotionOptions {
  /** Whether the modal is asked to show. */
  visible: boolean
  /** A bottom sheet (the app) slides; a card (the web) fades. */
  sheet: boolean
  /** While true, nothing closes it: no tap, button or key. */
  busy: boolean
  /** Called once the closing motion has finished. */
  onClose?: (() => void) | undefined
}

/** How long opening takes, in milliseconds. */
const OPEN_MS = 320

/** How long closing takes, in milliseconds; a little quicker than opening, like the system sheets. */
const CLOSE_MS = 240

/** Ease-out cubic: quick to start, gentle to settle. */
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1)

/** Ease-in cubic, for leaving: gentle to start, quick to finish. */
const EASE_IN = Easing.bezier(0.32, 0, 0.67, 0)

/** The scale the web card grows from as it fades in. */
const CARD_FROM = 0.97

/**
 * The opening and closing motion of a modal, run on the UI thread by Reanimated. In the app the sheet slides up from
 * below the screen and back down. On the web the card fades and grows a little. The backdrop
 * fades with both. With reduced motion nothing slides or grows; only the fades remain.
 * @param options - Whether it shows, its kind, whether it is busy and what closing calls.
 * @returns Whether it is up, the animated styles and the close request.
 */
export const useModalMotion = (options: IModalMotionOptions): IModalMotion => {
  const { busy, onClose, sheet, visible } = options
  const reduced = useReducedMotion()
  const { height } = useWindowDimensions()
  // 0 is closed and 1 is open.
  const progress = useSharedValue(0)
  // Whether the modal has finished opening and is up. The host stays mounted while the parent
  // shows it or while it is still open, so the closing motion can play after the parent hides it.
  const [opened, setOpened] = useState(false)

  const animateTo = useCallback(
    (toValue: 0 | 1, done?: () => void): void => {
      progress.set(
        withTiming(
          toValue,
          {
            duration: toValue === 1 ? OPEN_MS : CLOSE_MS,
            easing: toValue === 1 ? EASE_OUT : EASE_IN,
          },
          (finished?: boolean): void => {
            'worklet'

            if (finished === true && done !== undefined) scheduleOnRN(done)
          },
        ),
      )
    },
    [progress],
  )

  const markOpened = useCallback((): void => {
    setOpened(true)
  }, [])

  const markClosed = useCallback((): void => {
    setOpened(false)
  }, [])

  // Moves toward what the parent asks for: opens when shown, closes when hidden. Nothing to do
  // once the two agree. Each motion records where it ended in its end callback.
  useEffect(() => {
    if (visible === opened) return

    if (visible) {
      animateTo(1, markOpened)

      return
    }

    animateTo(0, markClosed)
  }, [animateTo, markClosed, markOpened, opened, visible])

  const finishClose = useCallback((): void => {
    setOpened(false)
    onClose?.()
  }, [onClose])

  // A close the person asks for plays the closing motion first, then tells the parent.
  const requestClose = useCallback((): void => {
    if (!busy) animateTo(0, finishClose)
  }, [animateTo, busy, finishClose])

  const backdrop = useAnimatedStyle((): ViewStyle => ({ opacity: progress.get() }))

  const panel = useAnimatedStyle((): ViewStyle => {
    if (sheet) {
      const slide = interpolate(progress.get(), [0, 1], [reduced ? 0 : height, 0])

      return { transform: [{ translateY: slide }] }
    }

    const scale = interpolate(progress.get(), [0, 1], [reduced ? 1 : CARD_FROM, 1])

    return { opacity: progress.get(), transform: [{ scale }] }
  })

  return {
    backdrop,
    mounted: visible || opened,
    panel,
    requestClose,
  }
}
