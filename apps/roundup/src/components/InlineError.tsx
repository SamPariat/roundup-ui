import type { ReactElement } from 'react'

import { View } from 'react-native'

import { Icon, Text } from '@roundup/ui'

/** Props for InlineError. */
export interface IInlineErrorProps {
  /** The message; nothing is drawn without one. */
  message: string | undefined
}

/**
 * An error line for a dialog that has no field to hang it on, such as a failed role change. It is
 * an alert, so it is announced when it appears.
 * @returns The icon and message, or null when there is no message.
 */
export const InlineError = ({ message }: IInlineErrorProps): null | ReactElement => {
  if (message === undefined) return null

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessible
      aria-live="assertive"
      className="flex-row items-center gap-2"
      role="alert"
    >
      <Icon decorative name="alert" size={18} tone="danger" />
      <Text className="min-w-0 flex-1" tone="danger" variant="body-sm">
        {message}
      </Text>
    </View>
  )
}
