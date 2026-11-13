import type { ReactElement } from 'react'

import { useState } from 'react'

import type { IDateTimeFormat } from '@roundup/ui'

import { DateFormatter } from '@roundup/core/date-formatter'
import { DateTimeField } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * The date field's wording, from core's formatter. The catalog has no CoreProvider, and the
 * package's index would pull in the native modules of its sources, so it takes the formatter by its
 * own entry and builds it instead of reading it from the deps.
 */
const FORMAT: IDateTimeFormat = new DateFormatter().field

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
