import type { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker'
import type { ReactElement } from 'react'

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useCallback } from 'react'
import { Platform, Pressable } from 'react-native'

import type { TIconName } from '../lib/icons'

import { FieldFrame } from './Field'
import { Icon } from './Icon'
import { Text } from './Text'

/** How a DateTimeField writes and reads a moment, which the caller supplies for the person's locale. */
export interface IDateTimeFormat {
  /**
   * Writes a moment as the field shows it.
   * @param date - The moment.
   * @returns The text, such as "Sat 31 Oct, 8:00 pm".
   */
  display: (date: Date) => string
  /**
   * Writes a moment as a browser's `datetime-local` input takes it.
   * @param date - The moment.
   * @returns The local date and time without a zone, such as 2026-10-31T20:00.
   */
  toInput: (date: Date) => string
  /**
   * Reads what a `datetime-local` input reports.
   * @param text - The input's value.
   * @returns The moment, or undefined while the input is incomplete or invalid.
   */
  fromInput: (text: string) => Date | undefined
}

/** Props for DateTimeField. */
export interface IDateTimeFieldProps {
  /** Required: a field with no visible name has no accessible name either. */
  label: string
  /** The chosen moment. */
  value: Date
  /** How the field writes and reads a moment. */
  format: IDateTimeFormat
  /** Hint shown under the field until there is an error. */
  helper?: string
  /** Replaces the helper text and turns the field red. */
  error?: string
  /** The earliest moment the picker offers. */
  minimumDate?: Date
  /** Icon drawn at the start of the field. */
  icon?: TIconName
  /** Called with the moment the person picks. */
  onChange: (value: Date) => void
}

/**
 * Opens Android's date dialog and then its time dialog, and reports the moment they make together.
 * @param start - The moment the dialogs start on.
 * @param minimumDate - The earliest date the dialog offers.
 * @param onChange - Called with the chosen moment once both dialogs are confirmed.
 */
const openAndroid = (
  start: Date,
  minimumDate: Date | undefined,
  onChange: (value: Date) => void,
): void => {
  DateTimePickerAndroid.open({
    ...(minimumDate === undefined ? {} : { minimumDate }),
    mode: 'date',
    /**
     * Moves on to the time once a date is confirmed.
     * @param _event - What the dialog reports.
     * @param date - The date picked.
     */
    onValueChange: (_event: DateTimePickerChangeEvent, date: Date): void => {
      DateTimePickerAndroid.open({
        mode: 'time',
        /**
         * Reports the date and the time together once the time is confirmed.
         * @param _timeEvent - What the dialog reports.
         * @param time - The time picked.
         */
        onValueChange: (_timeEvent: DateTimePickerChangeEvent, time: Date): void => {
          const picked = new Date(date)

          picked.setHours(time.getHours(), time.getMinutes(), 0, 0)
          onChange(picked)
        },
        value: date,
      })
    },
    value: start,
  })
}

/**
 * A labeled date and time field. On iOS the system's compact picker sits in the field; on Android
 * pressing the field opens the date dialog and then the time dialog; the web version (the
 * `.web` file) uses the browser's own date and time input. All of them take the same props.
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
  const handlePick = useCallback(
    (_event: DateTimePickerChangeEvent, date: Date): void => {
      onChange(date)
    },
    [onChange],
  )

  const handleOpen = useCallback((): void => {
    openAndroid(value, minimumDate, onChange)
  }, [minimumDate, onChange, value])

  const optional = {
    ...(error === undefined ? {} : { error }),
    ...(helper === undefined ? {} : { helper }),
  }

  if (Platform.OS === 'ios') {
    return (
      <FieldFrame disabled={false} focused={false} label={label} {...optional}>
        {icon === undefined ? null : <Icon decorative name={icon} tone="fg-muted" />}
        <DateTimePicker
          accessibilityLabel={label}
          display="compact"
          mode="datetime"
          onValueChange={handlePick}
          value={value}
          {...(minimumDate === undefined ? {} : { minimumDate })}
        />
      </FieldFrame>
    )
  }

  return (
    <FieldFrame disabled={false} focused={false} label={label} {...optional}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityValue={{ text: format.display(value) }}
        className="min-w-0 flex-1 flex-row items-center gap-2 self-stretch focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
        onPress={handleOpen}
      >
        {icon === undefined ? null : <Icon decorative name={icon} tone="fg-muted" />}
        <Text numberOfLines={1}>{format.display(value)}</Text>
      </Pressable>
    </FieldFrame>
  )
}
