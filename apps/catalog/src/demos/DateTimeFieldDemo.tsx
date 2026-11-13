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
 * DateTimeField resting, with a helper, an error, without a value and disabled, and one whose
 * chosen moment follows the picker: pressing it opens the picker in a Modal, and Done keeps what
 * was picked. It looks the same on iOS, Android and web.
 * @returns The specimens.
 */
export const DateTimeFieldDemo = (): ReactElement => {
  const [value, setValue] = useState<Date>(START)

  return (
    <>
      <Specimen title="default">
        <DateTimeField format={FORMAT} label="When" onChange={setValue} value={START} />
      </Specimen>
      <Specimen title="helper">
        <DateTimeField
          format={FORMAT}
          helper="People can suggest places until you start voting"
          label="Voting closes"
          onChange={setValue}
          value={START}
        />
      </Specimen>
      <Specimen note="The error replaces the helper and turns the field red." title="error">
        <DateTimeField
          error="Pick a start in the future."
          format={FORMAT}
          label="When"
          onChange={setValue}
          value={START}
        />
      </Specimen>
      <Specimen note="Until a moment is chosen the field shows its placeholder." title="empty">
        <DateTimeField format={FORMAT} label="When" onChange={setValue} />
      </Specimen>
      <Specimen title="disabled">
        <DateTimeField disabled format={FORMAT} label="When" onChange={setValue} value={START} />
      </Specimen>
      <Specimen note="Pick a moment and press Done; the field keeps it." title="Interactive">
        <DateTimeField format={FORMAT} label="When" onChange={setValue} value={value} />
      </Specimen>
    </>
  )
}
