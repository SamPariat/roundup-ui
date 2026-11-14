import { useCallback, useEffect, useState } from 'react'

/** How long a value must hold still before it settles, in milliseconds. Matches Explore's search. */
const DELAY = 400

/**
 * Follows a value once it stops changing, so typing does not start a request on every key.
 * @param value - The value as it changes, such as the words in a field.
 * @returns The value as of 400 ms after its last change.
 */
export const useDebounced = <T>(value: T): T => {
  const [settled, setSettled] = useState<T>(value)

  const handleStart = useCallback((): (() => void) => {
    const timer = setTimeout(setSettled, DELAY, value)

    return (): void => {
      clearTimeout(timer)
    }
  }, [value])

  useEffect(handleStart, [handleStart])

  return settled
}
