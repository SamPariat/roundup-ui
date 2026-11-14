import type { ReactElement } from 'react'

import { useEffect, useState } from 'react'
import { Animated, Platform, View } from 'react-native'

import type { IToastProps } from './Toast'

import { useReducedMotion } from '../lib/useReducedMotion'
import { SafeArea } from './SafeArea'
import { Toast } from './Toast'

/** How far the notice travels while sliding in and out, in points. */
const SLIDE = 16

/** How long the slide and fade take, in milliseconds. */
const DURATION = 220

/** Whether the animation can run on the native thread; the web has no native driver. */
const NATIVE_DRIVER = Platform.select({ default: true, web: false })

/** One message for the notifier to show. */
export interface INotice {
  /** Identifies the message. A new id replaces the one on screen and is announced again. */
  id: string
  /** The message, already translated. */
  message: string
  /** success, error or info, as Toast has them. */
  tone: NonNullable<IToastProps['tone']>
}

/** Props for Notifier. */
export interface INotifierProps {
  /** The message to show; undefined hides it. */
  notice?: INotice | undefined
}

/**
 * The app-wide notice host. It floats one Toast at the top of the screen, under the status bar,
 * above everything, and lets touches through everywhere else. It slides and fades in and out, or
 * just appears under Reduce Motion. Place it last in the root layout, inside the theme.
 * @returns The floating notice, or null while there is none.
 */
export const Notifier = ({ notice }: INotifierProps): null | ReactElement => {
  const reduced = useReducedMotion()

  const [progress] = useState<Animated.Value>((): Animated.Value => new Animated.Value(0))
  const [shown, setShown] = useState<INotice | undefined>(notice)

  // The last notice stays mounted while it slides out, so it does not vanish mid-animation.
  if (notice !== undefined && notice !== shown) setShown(notice)

  const visible = notice !== undefined

  useEffect(() => {
    const slide = Animated.timing(progress, {
      duration: reduced ? 0 : DURATION,
      toValue: visible ? 1 : 0,
      useNativeDriver: NATIVE_DRIVER,
    })

    slide.start(({ finished }) => {
      if (finished && !visible) setShown(undefined)
    })

    // A new notice, or the Notifier going away, stops the slide still running, so it does not
    // keep animating, or hold this component, after it is no longer wanted.
    return () => {
      slide.stop()
    }
  }, [visible, reduced, progress])

  if (shown === undefined) return null

  const translateY = reduced
    ? 0
    : progress.interpolate({ inputRange: [0, 1], outputRange: [-SLIDE, 0] })

  return (
    <SafeArea
      className="absolute inset-x-0 top-0 z-50"
      edges={['top', 'left', 'right']}
      pointerEvents="box-none"
    >
      <View className="mx-auto w-full max-w-content px-4 pt-2" pointerEvents="box-none">
        <Animated.View
          pointerEvents="box-none"
          style={{ opacity: progress, transform: [{ translateY }] }}
        >
          <Toast key={shown.id} tone={shown.tone}>
            {shown.message}
          </Toast>
        </Animated.View>
      </View>
    </SafeArea>
  )
}
