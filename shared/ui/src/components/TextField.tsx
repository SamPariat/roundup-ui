import type { ReactElement } from 'react'

import { TextInput } from 'react-native'

import type { IconName } from '../lib/icons.ts'

import { useFocus } from '../lib/useFocus.ts'
import { useRoleColor } from '../lib/useRoleColor'
import { FieldFrame } from './Field.tsx'
import { Icon } from './Icon.tsx'

const INPUT_TYPES = {
  text: { keyboardType: 'default', secureTextEntry: false, autoCapitalize: 'sentences' },
  email: { keyboardType: 'email-address', secureTextEntry: false, autoCapitalize: 'none' },
  password: { keyboardType: 'default', secureTextEntry: true, autoCapitalize: 'none' },
  number: { keyboardType: 'number-pad', secureTextEntry: false, autoCapitalize: 'none' },
} as const

/** Props for TextField. */
export interface TextFieldProps {
  /** Required: a field with no visible name has no accessible name either. */
  label: string
  /** The current text. */
  value?: string
  /** Hint shown while the field is empty. Not a substitute for the label. */
  placeholder?: string
  /** Hint shown under the field until there is an error. */
  helper?: string
  /** Replaces the helper text and turns the field red. */
  error?: string
  /** Makes the field read-only and greyed out. */
  disabled?: boolean
  /** Icon drawn at the start of the field. */
  icon?: IconName
  /** Keyboard and masking preset. Defaults to text. */
  type?: keyof typeof INPUT_TYPES
  /** Called with the text as it changes. */
  onChangeText?: (text: string) => void
}

/**
 * A labelled single-line input with helper and error text, a focus ring, and presets for text, email, password and number.
 * @returns The labelled field.
 */
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
  const { focused, onBlur, onFocus } = useFocus()
  const placeholderColor = useRoleColor('fg-subtle')

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
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        {...INPUT_TYPES[type]}
      />
    </FieldFrame>
  )
}
