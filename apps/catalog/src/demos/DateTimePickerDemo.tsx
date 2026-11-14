import type { ReactElement } from 'react'

import { useState } from 'react'

import type { IDateTimeFormat } from '@roundup/ui'

import { DateFormatter } from '@roundup/core/date-formatter'
import { DateTimePicker } from '@roundup/ui'

import { Specimen } from '@/components/Specimen'

/**
 * The picker's wording and date math, from core's formatter. The catalog has no CoreProvider, so
 * it builds the formatter and takes its field object, as the DateTimeField demo does.
 */
const FORMAT: IDateTimeFormat = new DateFormatter().field

/** The moment the specimens start on. */
const START = new Date(2026, 9, 31, 20)

/** The earliest moment of the specimen with a minimum: the day before it starts. */
const MIN = new Date(2026, 9, 30, 9)

/**
 * DateTimePicker with its days and time, with a minimum that turns earlier days and the month
 * before off, and with a finer minutes step. Each follows its own value. In the app it is the body
 * of a Modal.
 * @returns The specimens.
 */
export const DateTimePickerDemo = (): ReactElement => {
  const [value, setValue] = useState<Date>(START)
  const [minimum, setMinimum] = useState<Date>(START)
  const [fine, setFine] = useState<Date>(START)

  return (
    <>
      <Specimen title="default">
        <DateTimePicker format={FORMAT} onChange={setValue} value={value} />
      </Specimen>
      <Specimen
        note="Days before the minimum are off, and so is the month before it."
        title="min=Fri 30 Oct"
      >
        <DateTimePicker format={FORMAT} min={MIN} onChange={setMinimum} value={minimum} />
      </Specimen>
      <Specimen title="minuteStep=5">
        <DateTimePicker format={FORMAT} minuteStep={5} onChange={setFine} value={fine} />
      </Specimen>
    </>
  )
}
