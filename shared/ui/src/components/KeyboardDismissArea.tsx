import type { ReactElement, ReactNode } from 'react'

import { Keyboard, Platform, Pressable, View } from 'react-native'

/** Props for KeyboardDismissArea. */
export interface IKeyboardDismissAreaProps {
  /** What the area covers. */
  children: ReactNode
  /** Layout classes for the area's own view. */
  className: string
}

/** Puts the keyboard away. */
const handleDismissKeyboard = (): void => {
  Keyboard.dismiss()
}

/**
 * Puts the keyboard away when a tap lands in the area but on none of its buttons or fields: a
 * label, padding or the space between controls. Those keep their own taps. A scroll view only does
 * this for taps inside it, so this covers what sits outside one, like a sheet's title and actions or
 * a page's search bar. Screen readers skip it. On the web the browser already moves focus on a tap,
 * so it is a plain view there.
 * @returns A pressable view on the app, a plain view on the web.
 */
export const KeyboardDismissArea = ({
  children,
  className,
}: IKeyboardDismissAreaProps): ReactElement => {
  if (Platform.OS === 'web') return <View className={className}>{children}</View>

  return (
    <Pressable
      accessible={false}
      className={className}
      focusable={false}
      onPress={handleDismissKeyboard}
    >
      {children}
    </Pressable>
  )
}
