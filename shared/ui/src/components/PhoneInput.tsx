import type { ReactElement } from 'react'

import { TextInput, View } from 'react-native'

import { useT } from '@roundup/i18n'

import { useFocus } from '../lib/useFocus.ts'
import { useTheme } from '../theme/theme.tsx'
import { FieldFrame } from './Field.tsx'
import { Text } from './Text.tsx'

/** Props for PhoneInput. */
export interface PhoneInputProps {
  /** Required: for example "Phone number". */
  label: string
  /** The national number typed so far. */
  value?: string
  /** Hint shown under the field until there is an error. */
  helper?: string
  /** Error message that replaces the helper and turns the field red. */
  error?: string
  /** Makes the field read-only and greyed out. */
  disabled?: boolean
  /** Called with the digits as they change. */
  onChangeText?: (text: string) => void
}

/**
 * A phone number field with a fixed country prefix, a numeric keyboard and one-tap autofill of the device number.
 * @returns The labelled field.
 */
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
  const { t } = useT()

  return (
    <FieldFrame
      disabled={disabled}
      focused={focused}
      label={label}
      {...(error === undefined ? {} : { error })}
      {...(helper === undefined ? {} : { helper })}
    >
      <View aria-hidden className="h-6 flex-row items-center gap-2 border-r border-border pr-3">
        <Text variant="label">{t('phoneInput.countryCode')}</Text>
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
        placeholder={t('phoneInput.placeholder')}
        placeholderTextColor={roles['fg-subtle']}
        textContentType="telephoneNumber"
        value={value}
      />
    </FieldFrame>
  )
}
