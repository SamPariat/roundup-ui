import { enUS, fr } from 'date-fns/locale'

import { DateFormatter } from '../../src/helpers/date-formatter'

/** The helper under test. */
const dates = new DateFormatter()

/** Saturday, 31 October 2026, 8 pm in the zone the tests run in, as the API would send it. */
const SATURDAY_EVENING = new Date(2026, 9, 31, 20).toISOString()

describe('DateFormatter', () => {
  it('writes an event moment with its weekday, day and time', () => {
    expect(dates.eventWhen(SATURDAY_EVENING)).toBe('Sat 31st Oct 2026, 8:00 pm')
  })

  it('writes a deadline with its weekday and time', () => {
    expect(dates.deadline(new Date(2026, 9, 29, 21).toISOString())).toBe('Thu, 9:00 pm')
  })

  it('writes a day on its own with its ordinal and year', () => {
    expect(dates.day(new Date(2026, 9, 17, 23).toISOString())).toBe('17th Oct 2026')
  })

  it('reads the API text into the same moment, and writes a picked moment back', () => {
    const picked = new Date(2026, 9, 31, 20)

    expect(dates.parse(SATURDAY_EVENING).getTime()).toBe(picked.getTime())
    expect(dates.parse(dates.toIso(picked)).getTime()).toBe(picked.getTime())
  })

  describe('left', () => {
    /** 10:00 UTC on 14 November 2026, so no zone moves the day. */
    const NOW = Date.UTC(2026, 10, 14, 10)

    /**
     * An instant after NOW.
     * @param minutes - How many minutes after.
     * @param seconds - How many seconds more.
     * @returns The instant as the API sends it.
     */
    const after = (minutes: number, seconds = 0): string =>
      new Date(NOW + minutes * 60_000 + seconds * 1000).toISOString()

    it('words the two largest units', () => {
      expect(dates.left(NOW, after(3 * 24 * 60 + 21 * 60 + 15))).toBe('3 days 21 hours')
      expect(dates.left(NOW, after(5 * 60 + 12, 30))).toBe('5 hours 12 minutes')
      expect(dates.left(NOW, after(40, 10))).toBe('40 minutes')
    })

    it('leaves out a unit that is zero', () => {
      expect(dates.left(NOW, after(24 * 60 + 10))).toBe('1 day')
      expect(dates.left(NOW, after(3 * 60))).toBe('3 hours')
    })

    it('says less than a minute under a minute and once the moment has passed', () => {
      expect(dates.left(NOW, after(0, 59))).toBe('less than a minute')
      expect(dates.left(NOW, after(-60))).toBe('less than a minute')
      expect(dates.left(NOW, after(1))).toBe('1 minute')
    })

    it('follows the locale', () => {
      expect(new DateFormatter(fr).left(NOW, after(3 * 24 * 60 + 21 * 60 + 15))).toBe(
        '3 jours 21 heures',
      )
    })
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
    expect(dates.display(new Date(2026, 9, 31, 20))).toBe('Sat 31st Oct 2026, 8:00 pm')
  })

  it('writes the month the picker shows', () => {
    expect(dates.monthLabel(new Date(2026, 10, 14, 9))).toBe('November 2026')
  })

  it('heads the columns with the weekdays, Monday first', () => {
    expect(dates.weekdayLabels()).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })

  it('lays a month out in weeks from Monday, with blanks outside the month', () => {
    const weeks = dates.weeks(new Date(2026, 10, 14))

    // 1 November 2026 is a Sunday and the 30th a Monday: six weeks.
    expect(weeks).toHaveLength(6)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0]?.slice(0, 6).every((day) => day === undefined)).toBe(true)
    expect(weeks[0]?.[6]?.getTime()).toBe(new Date(2026, 10, 1).getTime())
    expect(weeks[5]?.[0]?.getTime()).toBe(new Date(2026, 10, 30).getTime())
    expect(weeks[5]?.slice(1).every((day) => day === undefined)).toBe(true)
    expect(weeks.flat().filter((day) => day !== undefined)).toHaveLength(30)
  })

  it('lays out only the weeks a month needs', () => {
    // February 2027 starts on a Monday and has 28 days: four full weeks.
    const weeks = dates.weeks(new Date(2027, 1, 10))

    expect(weeks).toHaveLength(4)
    expect(weeks.flat().every((day) => day !== undefined)).toBe(true)
  })

  it('writes a day the way a screen reader says it', () => {
    expect(dates.dayLabel(new Date(2026, 9, 31, 20))).toBe('Saturday 31 October')
  })

  it('writes the number of a day without a leading zero', () => {
    expect(dates.dayText(new Date(2026, 10, 7, 20))).toBe('7')
    expect(dates.dayText(new Date(2026, 10, 14))).toBe('14')
  })

  it('reads the clock', () => {
    const before = Date.now()
    const now = dates.today().getTime()

    expect(now).toBeGreaterThanOrEqual(before)
    expect(now).toBeLessThanOrEqual(Date.now())
  })

  it('tells whether two moments are on the same day', () => {
    expect(dates.isSameDay(new Date(2026, 10, 14, 1), new Date(2026, 10, 14, 23))).toBe(true)
    expect(dates.isSameDay(new Date(2026, 10, 14, 23), new Date(2026, 10, 15, 1))).toBe(false)
  })

  it('tells whether a moment is on an earlier day, whatever the time', () => {
    expect(dates.isBeforeDay(new Date(2026, 10, 13, 23), new Date(2026, 10, 14, 1))).toBe(true)
    expect(dates.isBeforeDay(new Date(2026, 10, 14, 1), new Date(2026, 10, 14, 23))).toBe(false)
    expect(dates.isBeforeDay(new Date(2026, 10, 15), new Date(2026, 10, 14))).toBe(false)
  })

  it('finds the start of a month', () => {
    expect(dates.startOfMonth(new Date(2026, 10, 14, 9, 30)).getTime()).toBe(
      new Date(2026, 10, 1).getTime(),
    )
  })

  it('moves by months, across a year', () => {
    expect(dates.addMonths(new Date(2026, 11, 1), 1).getTime()).toBe(new Date(2027, 0, 1).getTime())

    expect(dates.addMonths(new Date(2026, 0, 1), -1).getTime()).toBe(
      new Date(2025, 11, 1).getTime(),
    )
  })

  it('moves by minutes, rolling into the next day and the previous one', () => {
    expect(dates.addMinutes(new Date(2026, 10, 14, 23, 45), 15).getTime()).toBe(
      new Date(2026, 10, 15, 0, 0).getTime(),
    )

    expect(dates.addMinutes(new Date(2026, 10, 14, 0, 0), -15).getTime()).toBe(
      new Date(2026, 10, 13, 23, 45).getTime(),
    )
  })

  it('moves a moment to another day and keeps its time', () => {
    const moved = dates.withDay(new Date(2026, 10, 14, 20, 15), new Date(2026, 11, 2, 3, 4))

    expect(moved.getTime()).toBe(new Date(2026, 11, 2, 20, 15).getTime())
  })

  it('writes the hour on a 12-hour clock', () => {
    expect(dates.hourText(new Date(2026, 10, 14, 20))).toBe('8')
    expect(dates.hourText(new Date(2026, 10, 14, 0))).toBe('12')
    expect(dates.hourText(new Date(2026, 10, 14, 12))).toBe('12')
  })

  it('writes the minutes with a leading zero', () => {
    expect(dates.minuteText(new Date(2026, 10, 14, 20, 5))).toBe('05')
    expect(dates.minuteText(new Date(2026, 10, 14, 20, 45))).toBe('45')
  })

  it('tells am from pm', () => {
    expect(dates.isPm(new Date(2026, 10, 14, 11, 59))).toBe(false)
    expect(dates.isPm(new Date(2026, 10, 14, 12, 0))).toBe(true)
  })

  it('follows the locale for the first day of the week', () => {
    const sunday = new DateFormatter(enUS)

    expect(sunday.weekdayLabels()).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
    // 1 November 2026 is a Sunday, so it opens the first week.
    expect(sunday.weeks(new Date(2026, 10, 14))[0]?.[0]?.getDate()).toBe(1)
  })

  it('follows the locale for the clock', () => {
    const french = new DateFormatter(fr)
    const evening = new Date(2026, 9, 31, 20, 5)

    expect(dates.uses12Hour()).toBe(true)
    expect(french.uses12Hour()).toBe(false)
    expect(french.hourText(new Date(2026, 9, 31, 8))).toBe('08')
    expect(french.display(evening)).toBe('sam. 31 oct. 2026, 20:05')
    expect(french.deadline(evening.toISOString())).toBe('sam., 20:05')
  })

  it('gives a date field that does the same, as one object', () => {
    const picked = new Date(2026, 9, 31, 20, 5)
    const day = new Date(2026, 10, 3)

    expect(dates.field).toBe(dates.field)
    expect(dates.field.display(picked)).toBe(dates.display(picked))
    expect(dates.field.monthLabel(picked)).toBe(dates.monthLabel(picked))
    expect(dates.field.weekdayLabels()).toEqual(dates.weekdayLabels())
    expect(dates.field.weeks(picked)).toEqual(dates.weeks(picked))
    expect(dates.field.dayLabel(picked)).toBe(dates.dayLabel(picked))
    expect(dates.field.dayText(picked)).toBe('31')
    expect(dates.field.today().getTime()).toBeLessThanOrEqual(Date.now())
    expect(dates.field.isSameDay(picked, day)).toBe(false)
    expect(dates.field.isBeforeDay(picked, day)).toBe(true)
    expect(dates.field.startOfMonth(picked)).toEqual(dates.startOfMonth(picked))
    expect(dates.field.addMonths(picked, 1)).toEqual(dates.addMonths(picked, 1))
    expect(dates.field.addMinutes(picked, 15)).toEqual(dates.addMinutes(picked, 15))
    expect(dates.field.withDay(picked, day)).toEqual(dates.withDay(picked, day))
    expect(dates.field.hourText(picked)).toBe('8')
    expect(dates.field.minuteText(picked)).toBe('05')
    expect(dates.field.isPm(picked)).toBe(true)
    expect(dates.field.uses12Hour()).toBe(true)
  })
})
