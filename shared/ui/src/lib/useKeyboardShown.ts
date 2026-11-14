import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

/**
 * True while the on-screen keyboard is up. iOS reports it as the keyboard starts to move, so a view
 * that changes with it moves alongside the KeyboardAvoidingView; Android only reports it once the
 * keyboard is up.
 * @returns Whether the keyboard is showing; false on the web, where there is no such event.
 */
export const useKeyboardShown = (): boolean => {
  const [shown, setShown] = useState<boolean>(false)

  useEffect(() => {
    const ios = Platform.OS === 'ios'

    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setShown(true)
    })

    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setShown(false)
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return shown
}
