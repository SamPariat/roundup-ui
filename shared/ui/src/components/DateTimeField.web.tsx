import type { ChangeEvent, ReactElement } from 'react'

import { useCallback } from 'react'

import type { IDateTimeFieldProps } from './DateTimeField'

import { useFocus } from '../lib/useFocus'
import { FieldFrame } from './Field'
import { Icon } from './Icon'

/**
 * A labeled date and time field on web: the browser's own picker, in the same frame as TextField.
 * The native version of this file (DateTimeField.tsx) takes the same props.
 * @returns The labeled field.
 */
export const DateTimeField = ({
  error,
  format,
  helper,
  icon,
  label,
  minimumDate,
  onChange,
  value,
}: IDateTimeFieldProps): ReactElement => {
  const { focused, onBlur, onFocus } = useFocus()

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const picked = format.fromInput(event.target.value)

      if (picked !== undefined) onChange(picked)
    },
    [format, onChange],
  )

  return (
    <FieldFrame
      disabled={false}
      focused={focused}
      label={label}
      {...(error === undefined ? {} : { error })}
      {...(helper === undefined ? {} : { helper })}
    >
      {icon === undefined ? null : <Icon decorative name={icon} tone="fg-muted" />}
      <input
        aria-invalid={error !== undefined}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent p-0 type-body text-fg outline-none"
        min={minimumDate === undefined ? undefined : format.toInput(minimumDate)}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        type="datetime-local"
        value={format.toInput(value)}
      />
    </FieldFrame>
  )
}
