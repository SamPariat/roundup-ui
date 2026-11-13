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
})
