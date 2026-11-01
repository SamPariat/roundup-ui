import { hideAsync, setOptions } from 'expo-splash-screen'
import { useEffect } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'

/** The id of the splash element that src/app/+html.tsx puts in the static page. */
const WEB_SPLASH_ID = 'splash'

/** The part of a DOM element that hideWebSplash uses. */
export interface SplashElement {
  /** The element's classes, to start the fade. */
  classList: Pick<DOMTokenList, 'add'>
  /** Takes the element out of the page. */
  remove: () => void
  /** Listens for the end of the fade. */
  addEventListener: (
    type: 'transitionend',
    listener: () => void,
    options: {
      /**
       *
       */
      once: true
    },
  ) => void
}

/**
 * Takes the web splash away. With reduced motion it disappears at once; otherwise the page adds
 * the splash-hidden class, which fades it out, and the element is removed when the fade ends.
 * @param element - The splash element, or null when the page has none (a client-side render).
 * @param reduced - Whether the person asked for less motion.
 */
export const hideWebSplash = (element: null | SplashElement, reduced: boolean): void => {
  if (element === null) return

  if (reduced) {
    element.remove()

    return
  }

  element.addEventListener(
    'transitionend',
    () => {
      element.remove()
    },
    { once: true },
  )

  element.classList.add('splash-hidden')
}

/**
 * Keeps the splash screen up until the app is ready, then hides it. Native: the splash from the
 * expo-splash-screen config plugin stays (the root layout calls preventAutoHideAsync) and fades
 * out in 200 ms, or goes at once with reduced motion. Web: the mark that +html.tsx draws over the
 * static page is removed once the client has taken over, with the same fade rule.
 * @param ready - True once everything the first screen needs (fonts, the saved theme) is loaded.
 */
export const useSplash = (ready: boolean): void => {
  useEffect(() => {
    let active = true

    if (ready) {
      void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (!active) return

        if (Platform.OS === 'web') {
          hideWebSplash(document.querySelector<HTMLElement>(`#${WEB_SPLASH_ID}`), reduced)

          return
        }

        setOptions({ duration: 200, fade: !reduced })
        void hideAsync()
      })
    }

    return () => {
      active = false
    }
  }, [ready])
}
