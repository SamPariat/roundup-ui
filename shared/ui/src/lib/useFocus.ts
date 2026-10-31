import { useCallback, useState } from 'react'

/** Focus state and the handlers that keep it current. */
export interface FocusState {
  /** Whether the input has focus. */
  focused: boolean
  /** Handler for the input's onBlur. */
  onBlur: () => void
  /** Handler for the input's onFocus. */
  onFocus: () => void
}

/**
 * Focus state for an input, with stable handlers to spread onto it.
 * @returns The focus flag with stable handlers.
 */
export const useFocus = (): FocusState => {
  const [focused, setFocused] = useState(false)

  const onFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const onBlur = useCallback(() => {
    setFocused(false)
  }, [])

  return { focused, onBlur, onFocus }
}
