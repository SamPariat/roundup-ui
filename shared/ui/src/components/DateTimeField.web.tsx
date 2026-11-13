import type { ChangeEvent, ReactElement } from 'react'

import { format, isValid, parse } from 'date-fns'
import { useCallback } from 'react'

import type { IDateTimeFieldProps } from './DateTimeField'

import { useFocus } from '../lib/useFocus'
import { FieldFrame } from './Field'
import { Icon } from './Icon'

/** How a `datetime-local` input spells its value: the local date and time without a zone. */
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm"

/**
 * Reads what a `datetime-local` input reports.
 * @param value - What the browser reports, such as 2026-10-31T20:00.
 * @returns The moment, or undefined while the input is incomplete.
 */
const fromInput = (value: string): Date | undefined => {
  const date = parse(value, INPUT_FORMAT, new Date())

  return isValid(date) ? date : undefined
}

/**
 * A labeled date and time field on web: the browser's own picker, in the same frame as TextField.
 * The native version of this file (DateTimeField.tsx) takes the same props.
 * @returns The labeled field.
 */
export const DateTimeField = ({
  error,
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
      const picked = fromInput(event.target.value)

      if (picked !== undefined) onChange(picked)
    },
    [onChange],
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
        min={minimumDate === undefined ? undefined : format(minimumDate, INPUT_FORMAT)}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        type="datetime-local"
        value={format(value, INPUT_FORMAT)}
      />
    </FieldFrame>
  )
}
