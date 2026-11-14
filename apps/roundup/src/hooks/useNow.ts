import { useCallback, useEffect, useState } from 'react'

import { useDeps } from '@roundup/core'

/** How often the time is read again, in milliseconds: a minute, as often as a countdown changes. */
const TICK = 60_000

/**
 * The current time, read again every minute, so a countdown on screen stays right.
 * @returns The time in milliseconds since the epoch, as the app's clock gives it.
 */
export const useNow = (): number => {
  const { now } = useDeps()

  const [current, setCurrent] = useState<number>(now)

  const handleTick = useCallback((): void => {
    setCurrent(now())
  }, [now])

  const handleStart = useCallback((): (() => void) => {
    const timer = setInterval(handleTick, TICK)

    return (): void => {
      clearInterval(timer)
    }
  }, [handleTick])

  useEffect(handleStart, [handleStart])

  return current
}
