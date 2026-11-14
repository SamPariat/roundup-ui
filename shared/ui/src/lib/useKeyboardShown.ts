import type { KeyboardEventName } from 'react-native'

import { useCallback, useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

/**
 * True while the on-screen keyboard is up. iOS reports it as the keyboard starts to move, so a view
 * that changes with it moves alongside the KeyboardAvoidingView; Android only reports it once the
 * keyboard is up.
 * @returns Whether the keyboard is showing; false on the web, where there is no such event.
 */
export const useKeyboardShown = (): boolean => {
  const [shown, setShown] = useState<boolean>(false)

  const showEvent: KeyboardEventName = Platform.select({
    default: 'keyboardDidShow',
    ios: 'keyboardWillShow',
  })

  const hideEvent: KeyboardEventName = Platform.select({
    default: 'keyboardDidHide',
    ios: 'keyboardWillHide',
  })

  const handleShow = useCallback((): void => {
    setShown(true)
  }, [])

  const handleHide = useCallback((): void => {
    setShown(false)
  }, [])

  useEffect(() => {
    const show = Keyboard.addListener(showEvent, handleShow)
    const hide = Keyboard.addListener(hideEvent, handleHide)

    return () => {
      show.remove()
      hide.remove()
    }
  }, [handleHide, handleShow, hideEvent, showEvent])

  return shown
}
