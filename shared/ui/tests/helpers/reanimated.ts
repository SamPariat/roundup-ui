// A stand-in for the few Reanimated APIs the UI uses, loaded in place of the library by
// jest.setup.ts. Reanimated cannot load under Jest here: its native initializer installs a CSS
// handler its JS module lacks. Animations end at once on their targets and call their end
// callbacks, so a test sees the opened or closed state. It mirrors the library's API, so its
// exports are plain functions with the library's names.
import type { ViewStyle } from 'react-native'

import { useMemo, useRef } from 'react'
import { View } from 'react-native'

/** A shared value as the UI uses it: read and written through get and set. */
interface IFakeSharedValue<T> {
  /** Reads the current value. */
  get: () => T
  /** Replaces the value; an animation resolves straight to its target. */
  set: (next: T) => void
}

/** Called when an animation ends, with whether it ran to the end. */
type TFinished = (finished?: boolean) => void

/**
 * The identity curve: the stand-in draws no frames, so the shape of a curve does not matter.
 * @param t - Progress from 0 to 1.
 * @returns The same progress.
 */
const identity = (t: number): number => t

/** Animated views are plain views. */
export const Animated = { View }

/** Easing curves; each is the identity here. */
export const Easing = {
  /**
   * Builds a cubic Bézier curve.
   * @returns The identity curve.
   */
  bezier: (): ((t: number) => number) => identity,
}

/**
 * A value that keeps its state across renders.
 * @param initial - The starting value.
 * @returns The value with get and set.
 */
export const useSharedValue = <T>(initial: T): IFakeSharedValue<T> => {
  const valueRef = useRef(initial)

  return useMemo(
    (): IFakeSharedValue<T> => ({
      /**
       * Reads the value.
       * @returns The value now.
       */
      get: (): T => valueRef.current,
      /**
       * Replaces the value.
       * @param next - The new value.
       */
      set: (next: T): void => {
        valueRef.current = next
      },
    }),
    [],
  )
}

/**
 * Computes the style on each render.
 * @param updater - Builds the style from shared values.
 * @returns The style the updater builds now.
 */
export const useAnimatedStyle = (updater: () => ViewStyle): ViewStyle =>
  useMemo((): ViewStyle => updater(), [updater])

/**
 * Ends at once on the target and reports that it finished.
 * @param toValue - The value the animation ends on.
 * @param _config - The duration and easing, unused.
 * @param callback - Called with true once it has finished.
 * @returns The target.
 */
export const withTiming = (toValue: number, _config?: object, callback?: TFinished): number => {
  callback?.(true)

  return toValue
}

/**
 * Ends at once on the target.
 * @param toValue - Where the spring settles.
 * @returns The target.
 */
export const withSpring = (toValue: number): number => toValue

/**
 * Maps a value from one range onto another, in a straight line.
 * @param value - The input.
 * @param input - The input range, two points.
 * @param output - The output range, two points.
 * @returns The mapped value.
 */
export const interpolate = (value: number, input: number[], output: number[]): number => {
  const [inStart = 0, inEnd = 1] = input
  const [outStart = 0, outEnd = 1] = output

  return outStart + ((value - inStart) / (inEnd - inStart)) * (outEnd - outStart)
}

/**
 * The whole stand-in as a module, the shape jest.mock returns for Reanimated: the named APIs plus
 * the views as its default export.
 */
export const reanimatedModule = {
  __esModule: true,
  Animated,
  default: Animated,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
}
