import type { WeekOptions } from 'date-fns'

import {
  addDays,
  addMinutes,
  addMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  getHours,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  parseISO,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { enIN } from 'date-fns/locale'

/** How a moment reads with its weekday, day and time, such as "Sat 31 Oct, 8:00 pm". */
const EVENT_WHEN = 'EEE d MMM, h:mm aaa'

/** How a deadline reads with its weekday and time, such as "Thu, 9:00 pm". */
const DEADLINE = 'EEE, h:mm aaa'

/** How a past event's day reads, such as "17 Oct". */
const PAST_DAY = 'd MMM'

/** How a `datetime-local` input spells its value: the local date and time without a zone. */
const INPUT = "yyyy-MM-dd'T'HH:mm"

/** How a month reads above its days, such as "November 2026". */
const MONTH = 'MMMM yyyy'

/** How a weekday's initial reads over its column of days, such as "M". */
const WEEKDAY_INITIAL = 'EEEEE'

/** How a day reads to a screen reader, such as "Saturday 31 October". */
const DAY_NAME = 'EEEE d MMMM'

/** How a day's number reads in the picker's grid, without a leading zero, such as "7". */
const DAY_NUMBER = 'd'

/** How the hour of a time reads on a 12-hour clock, without a leading zero, such as "8". */
const HOUR = 'h'

/** How the minutes of a time read, with a leading zero, such as "05". */
const MINUTES = 'mm'

/** The first hour of the afternoon on a 24-hour clock. */
const NOON = 12

/** The date-fns option that starts a week on Monday, as the calendar of a date field does. */
const MONDAY_FIRST: WeekOptions = { weekStartsOn: 1 }

/**
 * How a date field and its picker write, read and step through moments. Typed structurally, so it
 * fits shared/ui's IDateTimeFormat without core importing the UI.
 */
export interface IDateField {
  /**
   * Writes a moment as the field shows it.
   * @param date - The moment.
   * @returns The text, such as "Sat 31 Oct, 8:00 pm".
   */
  display: (date: Date) => string
  /**
   * Writes a moment as a `datetime-local` input takes it.
   * @param date - The moment.
   * @returns The local date and time without a zone, such as 2026-10-31T20:00.
   */
  toInput: (date: Date) => string
  /**
   * Reads a `datetime-local` input's value.
   * @param text - The input's value.
   * @returns The moment, or undefined while the input is incomplete or invalid.
   */
  fromInput: (text: string) => Date | undefined
  /**
   * Writes the month the picker is showing.
   * @param month - Any moment in the month.
   * @returns The text, such as "November 2026".
   */
  monthLabel: (month: Date) => string
  /**
   * Writes the initials that head the picker's columns.
   * @returns Seven letters, Monday first.
   */
  weekdayLabels: () => string[]
  /**
   * Lays a month out as the picker's grid.
   * @param month - Any moment in the month.
   * @returns The weeks, Monday first, each of seven cells: the day, or undefined where the cell belongs to another month.
   */
  weeks: (month: Date) => (Date | undefined)[][]
  /**
   * Writes a day the way a screen reader says it.
   * @param date - The day to write.
   * @returns The text, such as "Saturday 31 October".
   */
  dayLabel: (date: Date) => string
  /**
   * Writes the number of a day for the picker's grid.
   * @param date - The day.
   * @returns The day of the month, such as "7".
   */
  dayText: (date: Date) => string
  /**
   * Reads the clock.
   * @returns The current moment.
   */
  today: () => Date
  /**
   * Whether two moments fall on the same day.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when both are on one day.
   */
  isSameDay: (date: Date, other: Date) => boolean
  /**
   * Whether a moment's day comes before another's, whatever the time.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when `date` falls on an earlier day.
   */
  isBeforeDay: (date: Date, other: Date) => boolean
  /**
   * Finds the first moment of a month.
   * @param date - Any moment in the month.
   * @returns Midnight on the 1st.
   */
  startOfMonth: (date: Date) => Date
  /**
   * Moves a moment by whole months.
   * @param date - The moment.
   * @param months - How many months to move, negative for earlier.
   * @returns The moment that many months away.
   */
  addMonths: (date: Date, months: number) => Date
  /**
   * Moves a moment by minutes, rolling over into the next or previous day.
   * @param date - The moment.
   * @param minutes - How many minutes to move, negative for earlier.
   * @returns The moment that many minutes away.
   */
  addMinutes: (date: Date, minutes: number) => Date
  /**
   * Puts a moment on another day and keeps its time.
   * @param date - The moment whose time is kept.
   * @param day - The day to move it to.
   * @returns The moment on that day at the same time.
   */
  withDay: (date: Date, day: Date) => Date
  /**
   * Writes the hour of a moment on a 12-hour clock.
   * @param date - The moment.
   * @returns The hour, such as "8".
   */
  hourText: (date: Date) => string
  /**
   * Writes the minutes of a moment.
   * @param date - The moment.
   * @returns The minutes, such as "05".
   */
  minuteText: (date: Date) => string
  /**
   * Whether a moment is from noon on.
   * @param date - The moment.
   * @returns True for pm, false for am.
   */
  isPm: (date: Date) => boolean
}

/**
 * Date parsing and wording for the whole client, so a moment reads the same on every screen. It is
 * the only place that calls date-fns. Deps creates one; reach it through useDeps().helpers.dates.
 */
export class DateFormatter {
  /**
   * What a date field needs to write and read a moment, ready to pass as its `format` prop. It is
   * one object for the life of the helper, so passing it never changes a field's props.
   */
  readonly field: IDateField = {
    /**
     * Reads a `datetime-local` input's value.
     * @param text - The input's value.
     * @returns The moment, or undefined while the input is incomplete or invalid.
     */
    fromInput: (text: string): Date | undefined => this.fromInput(text),
    /**
     * Writes a moment as a `datetime-local` input takes it.
     * @param date - The moment.
     * @returns The local date and time without a zone, such as 2026-10-31T20:00.
     */
    toInput: (date: Date): string => this.toInput(date),
    /**
     * Moves a moment by minutes, rolling over into the next or previous day.
     * @param date - The moment.
     * @param minutes - How many minutes to move.
     * @returns The moment that many minutes away.
     */
    addMinutes: (date: Date, minutes: number): Date => this.addMinutes(date, minutes),
    /**
     * Moves a moment by whole months.
     * @param date - The moment.
     * @param months - How many months to move.
     * @returns The moment that many months away.
     */
    addMonths: (date: Date, months: number): Date => this.addMonths(date, months),
    /**
     * Writes a day the way a screen reader says it.
     * @param date - The day to write.
     * @returns The text, such as "Saturday 31 October".
     */
    dayLabel: (date: Date): string => this.dayLabel(date),
    /**
     * Writes a moment as the field shows it.
     * @param date - The moment.
     * @returns The text, such as "Sat 31 Oct, 8:00 pm".
     */
    display: (date: Date): string => this.display(date),
    /**
     * Writes the hour of a moment on a 12-hour clock.
     * @param date - The moment.
     * @returns The hour, such as "8".
     */
    hourText: (date: Date): string => this.hourText(date),
    /**
     * Whether a moment's day comes before another's, whatever the time.
     * @param date - The moment to test.
     * @param other - The moment it is compared with.
     * @returns True when `date` falls on an earlier day.
     */
    isBeforeDay: (date: Date, other: Date): boolean => this.isBeforeDay(date, other),
    /**
     * Whether a moment is from noon on.
     * @param date - The moment.
     * @returns True for pm, false for am.
     */
    isPm: (date: Date): boolean => this.isPm(date),
    /**
     * Whether two moments fall on the same day.
     * @param date - The moment to test.
     * @param other - The moment it is compared with.
     * @returns True when both are on one day.
     */
    isSameDay: (date: Date, other: Date): boolean => this.isSameDay(date, other),
    /**
     * Writes the minutes of a moment.
     * @param date - The moment.
     * @returns The minutes, such as "05".
     */
    minuteText: (date: Date): string => this.minuteText(date),
    /**
     * Writes the month the picker is showing.
     * @param month - Any moment in the month.
     * @returns The text, such as "November 2026".
     */
    monthLabel: (month: Date): string => this.monthLabel(month),
    /**
     * Finds the first moment of a month.
     * @param date - Any moment in the month.
     * @returns Midnight on the 1st.
     */
    startOfMonth: (date: Date): Date => this.startOfMonth(date),
    /**
     * Writes the number of a day for the picker's grid.
     * @param date - The day to write.
     * @returns The day of the month, such as "7".
     */
    dayText: (date: Date): string => this.dayText(date),
    /**
     * Reads the clock.
     * @returns The current moment.
     */
    today: (): Date => this.today(),
    /**
     * Writes the initials that head the picker's columns.
     * @returns Seven letters, Monday first.
     */
    weekdayLabels: (): string[] => this.weekdayLabels(),
    /**
     * Lays a month out as the picker's grid.
     * @param month - Any moment in the month.
     * @returns The weeks, Monday first; undefined marks a cell of another month.
     */
    weeks: (month: Date): (Date | undefined)[][] => this.weeks(month),
    /**
     * Puts a moment on another day and keeps its time.
     * @param date - The moment whose time is kept.
     * @param day - The day to move it to.
     * @returns The moment on that day at the same time.
     */
    withDay: (date: Date, day: Date): Date => this.withDay(date, day),
  }

  /**
   * Reads a moment the API sent.
   * @param iso - The ISO 8601 text.
   * @returns The moment.
   */
  parse(iso: string): Date {
    return parseISO(iso)
  }

  /**
   * Writes a moment the way the API takes it.
   * @param date - The moment, such as one a picker gave.
   * @returns The ISO 8601 text, with the zone offset.
   */
  toIso(date: Date): string {
    return formatISO(date)
  }

  /**
   * Writes an event's moment: "Sat 31 Oct, 8:00 pm".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  eventWhen(iso: string): string {
    return this.display(this.parse(iso))
  }

  /**
   * Writes a moment the way an event's moment reads: "Sat 31 Oct, 8:00 pm".
   * @param date - The moment, such as one a picker gave.
   * @returns The text, in the device's time zone.
   */
  display(date: Date): string {
    return format(date, EVENT_WHEN, { locale: enIN })
  }

  /**
   * Writes a moment as a `datetime-local` input takes it.
   * @param date - The moment.
   * @returns The local date and time without a zone, such as 2026-10-31T20:00.
   */
  toInput(date: Date): string {
    return format(date, INPUT)
  }

  /**
   * Reads what a `datetime-local` input reports.
   * @param text - The input's value.
   * @returns The moment, or undefined while the input is incomplete or invalid.
   */
  fromInput(text: string): Date | undefined {
    const date = parse(text, INPUT, new Date())

    return isValid(date) ? date : undefined
  }

  /**
   * Writes a voting deadline: "Thu, 9:00 pm".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  deadline(iso: string): string {
    return format(this.parse(iso), DEADLINE, { locale: enIN })
  }

  /**
   * Writes the day a past event closed: "17 Oct".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  pastDay(iso: string): string {
    return format(this.parse(iso), PAST_DAY, { locale: enIN })
  }

  /**
   * The moment tomorrow at a given hour, on the hour.
   * @param now - The current time in milliseconds.
   * @param hour - The hour of the day, 0 to 23.
   * @returns The moment, in the device's time zone.
   */
  tomorrowAt(now: number, hour: number): Date {
    return set(addDays(now, 1), { hours: hour, milliseconds: 0, minutes: 0, seconds: 0 })
  }

  /**
   * Whether a moment comes after another.
   * @param date - The moment to test.
   * @param other - The moment it is compared with, or a time in milliseconds.
   * @returns True when `date` is later.
   */
  isAfter(date: Date, other: Date | number): boolean {
    return isAfter(date, other)
  }

  /**
   * Writes the month the picker is showing: "November 2026".
   * @param month - Any moment in the month.
   * @returns The text.
   */
  monthLabel(month: Date): string {
    return format(month, MONTH, { locale: enIN })
  }

  /**
   * Writes the initials that head the picker's columns: "M", "T", "W", "T", "F", "S", "S".
   * @returns Seven letters, Monday first.
   */
  weekdayLabels(): string[] {
    const monday = startOfWeek(this.today(), MONDAY_FIRST)

    return eachDayOfInterval({ end: endOfWeek(monday, MONDAY_FIRST), start: monday }).map(
      (day: Date): string => format(day, WEEKDAY_INITIAL, { locale: enIN }),
    )
  }

  /**
   * Lays a month out as the picker's grid: whole weeks from Monday, with the days of the month and
   * a blank where a cell belongs to the month before or after.
   * @param month - Any moment in the month.
   * @returns The weeks, each of seven cells: the day, or undefined for a blank.
   */
  weeks(month: Date): (Date | undefined)[][] {
    const starts = eachWeekOfInterval(
      { end: endOfMonth(month), start: startOfMonth(month) },
      MONDAY_FIRST,
    )

    return starts.map((monday: Date): (Date | undefined)[] =>
      eachDayOfInterval({ end: endOfWeek(monday, MONDAY_FIRST), start: monday }).map(
        (day: Date): Date | undefined => (isSameMonth(day, month) ? day : undefined),
      ),
    )
  }

  /**
   * Writes a day the way a screen reader says it: "Saturday 31 October".
   * @param date - The day to write.
   * @returns The text.
   */
  dayLabel(date: Date): string {
    return format(date, DAY_NAME, { locale: enIN })
  }

  /**
   * Writes the number of a day for the picker's grid: "7".
   * @param date - The day to write.
   * @returns The day of the month, without a leading zero.
   */
  dayText(date: Date): string {
    return format(date, DAY_NUMBER)
  }

  /**
   * Reads the clock.
   * @returns The current moment, in the device's time zone.
   */
  today(): Date {
    return new Date()
  }

  /**
   * Whether two moments fall on the same day.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when both are on one day.
   */
  isSameDay(date: Date, other: Date): boolean {
    return isSameDay(date, other)
  }

  /**
   * Whether a moment's day comes before another's, whatever the time.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when `date` falls on an earlier day.
   */
  isBeforeDay(date: Date, other: Date): boolean {
    return isBefore(startOfDay(date), startOfDay(other))
  }

  /**
   * Finds the first moment of a month.
   * @param date - Any moment in the month.
   * @returns Midnight on the 1st.
   */
  startOfMonth(date: Date): Date {
    return startOfMonth(date)
  }

  /**
   * Moves a moment by whole months.
   * @param date - The moment.
   * @param months - How many months to move, negative for earlier.
   * @returns The moment that many months away.
   */
  addMonths(date: Date, months: number): Date {
    return addMonths(date, months)
  }

  /**
   * Moves a moment by minutes, rolling over into the next or previous day.
   * @param date - The moment.
   * @param minutes - How many minutes to move, negative for earlier.
   * @returns The moment that many minutes away.
   */
  addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes)
  }

  /**
   * Puts a moment on another day and keeps its time.
   * @param date - The moment whose time is kept.
   * @param day - The day to move it to.
   * @returns The moment on that day at the same time.
   */
  withDay(date: Date, day: Date): Date {
    return set(date, { date: day.getDate(), month: day.getMonth(), year: day.getFullYear() })
  }

  /**
   * Writes the hour of a moment on a 12-hour clock: "8".
   * @param date - The moment.
   * @returns The hour, without a leading zero.
   */
  hourText(date: Date): string {
    return format(date, HOUR)
  }

  /**
   * Writes the minutes of a moment: "05".
   * @param date - The moment.
   * @returns The minutes, with a leading zero.
   */
  minuteText(date: Date): string {
    return format(date, MINUTES)
  }

  /**
   * Whether a moment is from noon on.
   * @param date - The moment.
   * @returns True for pm, false for am.
   */
  isPm(date: Date): boolean {
    return getHours(date) >= NOON
  }
}
