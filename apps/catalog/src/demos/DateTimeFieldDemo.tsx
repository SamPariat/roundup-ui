import type { ReactElement } from 'react'

import { useState } from 'react'

import type { IDateTimeFormat } from '@roundup/ui'

import { DateTimeField } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * Pads a part of a date to two digits.
 * @param part - A day, hour or minute.
 * @returns The padded text.
 */
const pad = (part: number): string => String(part).padStart(2, '0')

/**
 * Writes a moment for the field.
 * @param date - The moment.
 * @returns The date and time, such as "31 Oct 2026, 8:00 pm".
 */
const display = (date: Date): string =>
  date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Writes a moment as a datetime-local input takes it.
 * @param date - The moment.
 * @returns The local date and time, such as 2026-10-31T20:00.
 */
const toInput = (date: Date): string =>
  `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`

/**
 * Reads a datetime-local input's value.
 * @param text - The input's value.
 * @returns The moment, or undefined while it is incomplete.
 */
const fromInput = (text: string): Date | undefined => {
  const date = new Date(text)

  return Number.isNaN(date.getTime()) ? undefined : date
}

/** A demo's own format, from Intl: the catalog is a demo app and does not depend on core. */
const FORMAT: IDateTimeFormat = { display, fromInput, toInput }

/** The moment the interactive specimen starts on. */
const START = new Date(2026, 9, 31, 20)

/**
 * DateTimeField resting, with a helper and with an error, and one whose chosen moment follows the
 * picker. On iOS the system picker sits in the field, on Android the field opens the date and time
 * dialogs, and on web it is the browser's own input.
 * @returns The specimens.
 */
export const DateTimeFieldDemo = (): ReactElement => {
  const [value, setValue] = useState<Date>(START)

  return (
    <>
      <Specimen title="default">
        <DateTimeField
          format={FORMAT}
          icon="clock"
          label="When"
          onChange={setValue}
          value={START}
        />
      </Specimen>
      <Specimen title="helper">
        <DateTimeField
          format={FORMAT}
          helper="People can suggest places until you start voting"
          icon="clock"
          label="Voting closes"
          onChange={setValue}
          value={START}
        />
      </Specimen>
      <Specimen note="The error replaces the helper and turns the field red." title="error">
        <DateTimeField
          error="Pick a start in the future."
          format={FORMAT}
          icon="clock"
          label="When"
          onChange={setValue}
          value={START}
        />
      </Specimen>
      <Specimen note="Pick a moment; the field keeps it." title="Interactive">
        <DateTimeField
          format={FORMAT}
          icon="clock"
          label="When"
          onChange={setValue}
          value={value}
        />
      </Specimen>
    </>
  )
}
