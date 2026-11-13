import { DateFormatter } from '../../src/helpers/date-formatter'

/** The helper under test. */
const dates = new DateFormatter()

/** Saturday, 31 October 2026, 8 pm in the zone the tests run in, as the API would send it. */
const SATURDAY_EVENING = new Date(2026, 9, 31, 20).toISOString()

describe('DateFormatter', () => {
  it('writes an event moment with its weekday, day and time', () => {
    expect(dates.eventWhen(SATURDAY_EVENING)).toBe('Sat 31 Oct, 8:00 pm')
  })

  it('writes a deadline with its weekday and time', () => {
    expect(dates.deadline(new Date(2026, 9, 29, 21).toISOString())).toBe('Thu, 9:00 pm')
  })

  it('writes the day a past event closed', () => {
    expect(dates.pastDay(new Date(2026, 9, 17, 23).toISOString())).toBe('17 Oct')
  })

  it('reads the API text into the same moment, and writes a picked moment back', () => {
    const picked = new Date(2026, 9, 31, 20)

    expect(dates.parse(SATURDAY_EVENING).getTime()).toBe(picked.getTime())
    expect(dates.parse(dates.toIso(picked)).getTime()).toBe(picked.getTime())
  })

  it('finds tomorrow at an hour, on the hour', () => {
    const tomorrow = dates.tomorrowAt(new Date(2026, 10, 11, 12, 34, 56).getTime(), 20)

    expect(tomorrow.getTime()).toBe(new Date(2026, 10, 12, 20).getTime())
  })

  it('tells which moment is later', () => {
    const early = new Date(2026, 9, 31, 20)
    const late = new Date(2026, 9, 31, 21)

    expect(dates.isAfter(late, early)).toBe(true)
    expect(dates.isAfter(early, late.getTime())).toBe(false)
  })

  it('writes a picked moment the way an event reads', () => {
    expect(dates.display(new Date(2026, 9, 31, 20))).toBe('Sat 31 Oct, 8:00 pm')
  })

  it('writes and reads a datetime-local value', () => {
    const picked = new Date(2026, 9, 31, 20, 5)

    expect(dates.toInput(picked)).toBe('2026-10-31T20:05')
    expect(dates.fromInput('2026-10-31T20:05')?.getTime()).toBe(picked.getTime())
  })

  it.each(['', '2026-10-31', '2026-10-31T2', 'soon'])('reads %j as an incomplete input', (text) => {
    expect(dates.fromInput(text)).toBeUndefined()
  })

  it('gives a date field that does the same, as one object', () => {
    const picked = new Date(2026, 9, 31, 20)

    expect(dates.field).toBe(dates.field)
    expect(dates.field.display(picked)).toBe(dates.display(picked))
    expect(dates.field.toInput(picked)).toBe(dates.toInput(picked))
    expect(dates.field.fromInput('2026-10-31T20:00')?.getTime()).toBe(picked.getTime())
  })
})
