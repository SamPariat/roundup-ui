import type {
  GestureResponderEvent,
  GestureResponderHandlers,
  PanResponderGestureState,
  ViewStyle,
} from 'react-native'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Animated, Easing, PanResponder, useWindowDimensions } from 'react-native'

import { useReducedMotion } from './useReducedMotion'

/** What the modal needs to move: whether it is up, the animated styles and the drag handlers. */
export interface IModalMotion {
  /** Whether the native modal host is showing; it stays up until the closing motion ends. */
  mounted: boolean
  /** The backdrop's fade. */
  backdrop: Animated.WithAnimatedValue<ViewStyle>
  /** The sheet's slide (app) or the card's fade and scale (web). */
  panel: Animated.WithAnimatedValue<ViewStyle>
  /** Spread on the part of the sheet a finger drags down: the handle and the header. */
  dragHandlers: GestureResponderHandlers
  /** Asks to close: unless busy, plays the closing motion, then calls onClose. */
  requestClose: () => void
}

/** Options for useModalMotion. */
export interface IModalMotionOptions {
  /** Whether the modal is asked to show. */
  visible: boolean
  /** A bottom sheet (the app) slides; a card (the web) fades. */
  sheet: boolean
  /** While true, nothing closes it: no drag, tap, button or key. */
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

/** How far down, in points, a released drag must reach to close the sheet. */
const DISMISS_DISTANCE = 120

/** How fast, in points per millisecond, a released flick must go to close the sheet. */
const DISMISS_VELOCITY = 1

/** How far a finger must move before the drag takes over from a tap, in points. */
const DRAG_SLOP = 4

/** The scale the web card grows from as it fades in. */
const CARD_FROM = 0.97

/**
 * The opening, closing and drag-to-dismiss motion of a modal. In the app the sheet slides up from
 * below the screen and back down, follows a finger dragging it down, and closes when let go far or
 * fast enough, otherwise springing back. On the web the card fades and grows a little. The backdrop
 * fades with both. With reduced motion nothing slides or grows; only the fades remain.
 * @param options - Whether it shows, its kind, whether it is busy and what closing calls.
 * @returns Whether it is up, the animated styles, the drag handlers and the close request.
 */
export const useModalMotion = (options: IModalMotionOptions): IModalMotion => {
  const { busy, onClose, sheet, visible } = options
  const reduced = useReducedMotion()
  const { height } = useWindowDimensions()
  const [progress] = useState((): Animated.Value => new Animated.Value(0))
  const [drag] = useState((): Animated.Value => new Animated.Value(0))
  // `leaving` keeps the host up while the closing motion plays after the parent hides it;
  // `dismissed` takes it down after a close the person asked for, until the parent shows it again.
  const [leaving, setLeaving] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [shownBefore, setShownBefore] = useState(visible)

  // Reacts to the parent showing or hiding the modal during render, not in an effect.
  if (visible !== shownBefore) {
    setShownBefore(visible)
    setDismissed(false)
    setLeaving(!visible)
  }

  const animateTo = useCallback(
    (toValue: 0 | 1, done?: () => void): void => {
      Animated.timing(progress, {
        duration: toValue === 1 ? OPEN_MS : CLOSE_MS,
        easing: toValue === 1 ? EASE_OUT : EASE_IN,
        toValue,
        useNativeDriver: true,
      }).start(done)
    },
    [progress],
  )

  const finishLeaving = useCallback((): void => {
    setLeaving(false)
  }, [])

  // Plays the opening motion when shown, and the closing one when the parent hides it.
  useEffect(() => {
    if (visible) {
      drag.setValue(0)
      animateTo(1)
    } else if (leaving) {
      animateTo(0, finishLeaving)
    }
  }, [animateTo, drag, finishLeaving, leaving, visible])

  const finishDismiss = useCallback((): void => {
    setDismissed(true)
    onClose?.()
  }, [onClose])

  const requestClose = useCallback((): void => {
    if (!busy) animateTo(0, finishDismiss)
  }, [animateTo, busy, finishDismiss])

  const springBack = useCallback((): void => {
    Animated.spring(drag, { bounciness: 0, toValue: 0, useNativeDriver: true }).start()
  }, [drag])

  const shouldDrag = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState): boolean =>
      !busy && gesture.dy > DRAG_SLOP && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    [busy],
  )

  const followFinger = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState): void => {
      drag.setValue(Math.max(0, gesture.dy))
    },
    [drag],
  )

  const letGo = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState): void => {
      if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) requestClose()
      else springBack()
    },
    [requestClose, springBack],
  )

  const dragHandlers = useMemo(
    (): GestureResponderHandlers =>
      sheet
        ? PanResponder.create({
            onMoveShouldSetPanResponder: shouldDrag,
            onPanResponderMove: followFinger,
            onPanResponderRelease: letGo,
            onPanResponderTerminate: springBack,
          }).panHandlers
        : {},
    [followFinger, letGo, sheet, shouldDrag, springBack],
  )

  const backdrop = useMemo(
    (): Animated.WithAnimatedValue<ViewStyle> => ({ opacity: progress }),
    [progress],
  )

  const panel = useMemo((): Animated.WithAnimatedValue<ViewStyle> => {
    if (sheet) {
      const slide = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [reduced ? 0 : height, 0],
      })

      return { transform: [{ translateY: Animated.add(slide, drag) }] }
    }

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [reduced ? 1 : CARD_FROM, 1],
    })

    return { opacity: progress, transform: [{ scale }] }
  }, [drag, height, progress, reduced, sheet])

  return {
    backdrop,
    dragHandlers,
    mounted: (visible && !dismissed) || leaving,
    panel,
    requestClose,
  }
}
