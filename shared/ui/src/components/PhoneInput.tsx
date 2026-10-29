import type { ReactElement } from 'react'

import { TextInput, View } from 'react-native'

import { useFocus } from '../lib/use-focus.ts'
import { useTheme } from '../theme/theme.tsx'
import { FieldFrame } from './Field.tsx'
import { Text } from './Text.tsx'

export interface PhoneInputProps {
  /** Required: for example "Phone number". */
  label: string
  value?: string
  helper?: string
  error?: string
  disabled?: boolean
  onChangeText?: (text: string) => void
}

export const PhoneInput = ({
  disabled = false,
  error,
  helper,
  label,
  onChangeText,
  value,
}: PhoneInputProps): ReactElement => {
  const { focused, onBlur, onFocus } = useFocus()
  const { roles } = useTheme()

  return (
    <FieldFrame
      disabled={disabled}
      focused={focused}
      label={label}
      {...(error === undefined ? {} : { error })}
      {...(helper === undefined ? {} : { helper })}
    >
      <View aria-hidden className="h-6 flex-row items-center gap-2 border-r border-border pr-3">
        <Text variant="label">IN +91</Text>
      </View>
      <TextInput
        accessibilityHint={error ?? helper}
        accessibilityLabel={label}
        aria-disabled={disabled}
        aria-invalid={error !== undefined}
        autoComplete="tel-national"
        className="min-w-0 flex-1 p-0 type-body text-fg"
        editable={!disabled}
        inputMode="numeric"
        keyboardType="phone-pad"
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder="98765 43210"
        placeholderTextColor={roles['fg-subtle']}
        textContentType="telephoneNumber"
        value={value}
      />
    </FieldFrame>
  )
}
