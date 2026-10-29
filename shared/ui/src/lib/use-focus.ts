import { useCallback, useState } from 'react'

/** Focus state for an input, with stable handlers to spread onto it. */
export const useFocus = (): { focused: boolean; onBlur: () => void; onFocus: () => void } => {
  const [focused, setFocused] = useState(false)

  const onFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const onBlur = useCallback(() => {
    setFocused(false)
  }, [])

  return { focused, onBlur, onFocus }
}
