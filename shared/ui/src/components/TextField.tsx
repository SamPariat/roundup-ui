import type { ReactElement } from 'react'

import { useState } from 'react'
import { TextInput } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { useTheme } from '../theme/theme.tsx'
import { FieldFrame } from './Field.tsx'
import { Icon } from './Icon.tsx'

const INPUT_TYPES = {
  text: { keyboardType: 'default', secureTextEntry: false, autoCapitalize: 'sentences' },
  email: { keyboardType: 'email-address', secureTextEntry: false, autoCapitalize: 'none' },
  password: { keyboardType: 'default', secureTextEntry: true, autoCapitalize: 'none' },
  number: { keyboardType: 'number-pad', secureTextEntry: false, autoCapitalize: 'none' },
} as const

export interface TextFieldProps {
  /** Required: a field with no visible name has no accessible name either. */
  label: string
  value?: string
  placeholder?: string
  helper?: string
  /** Replaces the helper text and turns the field red. */
  error?: string
  disabled?: boolean
  icon?: IconName
  type?: keyof typeof INPUT_TYPES
  onChangeText?: (text: string) => void
}

export const TextField = ({
  disabled = false,
  error,
  helper,
  icon,
  label,
  onChangeText,
  placeholder,
  type = 'text',
  value,
}: TextFieldProps): ReactElement => {
  const [focused, setFocused] = useState(false)
  const { roles } = useTheme()

  return (
    <FieldFrame
      disabled={disabled}
      focused={focused}
      label={label}
      {...(error === undefined ? {} : { error })}
      {...(helper === undefined ? {} : { helper })}
    >
      {icon === undefined ? null : <Icon decorative name={icon} tone="fg-muted" />}
      <TextInput
        accessibilityHint={error ?? helper}
        accessibilityLabel={label}
        aria-disabled={disabled}
        aria-invalid={error !== undefined}
        className="min-w-0 flex-1 p-0 type-body text-fg"
        editable={!disabled}
        onBlur={() => {
          setFocused(false)
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true)
        }}
        placeholder={placeholder}
        placeholderTextColor={roles['fg-subtle']}
        value={value}
        {...INPUT_TYPES[type]}
      />
    </FieldFrame>
  )
}
