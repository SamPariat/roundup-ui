import { useEffect, useState } from 'react'

/**
 * Follows a value, but only after it has stopped changing for a moment, so typing does not send a
 * request per keystroke.
 * @param value - The value to follow.
 * @param delay - How long it must stay unchanged, in milliseconds.
 * @returns The value as it was when it last held still; the first value at once.
 */
export const useDebounced = <T>(value: T, delay: number): T => {
  const [settled, setSettled] = useState<T>(value)

  useEffect(() => {
    // setSettled is handed to the timer with the value as its argument, so no function is built here.
    const timer = setTimeout(setSettled, delay, value)

    return () => {
      clearTimeout(timer)
    }
  }, [delay, value])

  return settled
}
