import { renderHook, waitFor } from '@testing-library/react-native'
import { hideAsync, setOptions } from 'expo-splash-screen'
import { AccessibilityInfo } from 'react-native'

import type { SplashElement } from '../../src/hooks/useSplash.ts'

import { hideWebSplash, useSplash } from '../../src/hooks/useSplash.ts'

/** Props of the hook under test. */
interface ReadyProps {
  /** Whether the app is ready. */
  ready: boolean
}

/** A stand-in splash element and what was done to it. */
interface FakeSplash {
  /** The element to pass to hideWebSplash. */
  element: SplashElement
  /** The calls made on it, in order. */
  log: string[]
}

jest.mock('expo-splash-screen', () => ({ hideAsync: jest.fn(), setOptions: jest.fn() }))

describe('useSplash', () => {
  beforeEach(() => {
    jest.mocked(hideAsync).mockClear()
    jest.mocked(setOptions).mockClear()
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
  })

  it('keeps the splash screen while the app is not ready', async () => {
    await renderHook(() => {
      useSplash(false)
    })

    expect(hideAsync).not.toHaveBeenCalled()
  })

  it('hides the splash screen with a quick fade once the app is ready', async () => {
    const { rerender } = await renderHook(
      ({ ready }: ReadyProps) => {
        useSplash(ready)
      },
      { initialProps: { ready: false } },
    )

    await rerender({ ready: true })

    await waitFor(() => {
      expect(hideAsync).toHaveBeenCalledTimes(1)
    })

    expect(setOptions).toHaveBeenCalledWith({ duration: 200, fade: true })
  })

  it('hides it without a fade when the person asked for reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)

    await renderHook(() => {
      useSplash(true)
    })

    await waitFor(() => {
      expect(hideAsync).toHaveBeenCalledTimes(1)
    })

    expect(setOptions).toHaveBeenCalledWith({ duration: 200, fade: false })
  })
})

/**
 * Builds a stand-in for the splash element that records what was done to it.
 * @returns The element and the log of its calls.
 */
const fakeElement = (): FakeSplash => {
  const log: string[] = []

  /**
   * Records a class being added.
   * @param name - The class.
   */
  const add = (name: string): void => {
    log.push(`add ${name}`)
  }

  /** Records the element being removed. */
  const remove = (): void => {
    log.push('remove')
  }

  /**
   * Records a listener and runs it at once, as if the fade had ended.
   * @param type - The event name.
   * @param listener - The callback.
   */
  const addEventListener = (type: 'transitionend', listener: () => void): void => {
    log.push(`listen ${type}`)
    listener()
  }

  const element: SplashElement = { classList: { add }, remove, addEventListener }

  return { element, log }
}

describe('hideWebSplash', () => {
  it('does nothing when the page has no splash', () => {
    expect(() => {
      hideWebSplash(null, false)
    }).not.toThrow()
  })

  it('removes the splash at once with reduced motion', () => {
    const { element, log } = fakeElement()

    hideWebSplash(element, true)

    expect(log).toEqual(['remove'])
  })

  it('fades the splash out and removes it when the fade ends', () => {
    const { element, log } = fakeElement()

    hideWebSplash(element, false)

    expect(log).toEqual(['listen transitionend', 'remove', 'add splash-hidden'])
  })
})
