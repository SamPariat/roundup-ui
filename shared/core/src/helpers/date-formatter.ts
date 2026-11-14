import type { Locale } from 'date-fns'

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
  parseISO,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { enIN } from 'date-fns/locale'

/** How a moment reads with its weekday and day, before the time, such as "Sat 31st Oct 2026". */
const EVENT_DAY = 'EEE do MMM yyyy'

/** How a deadline reads with its weekday, before the time, such as "Thu". */
const DEADLINE_DAY = 'EEE'

/** How a time reads on a 12-hour clock, such as "8:00 pm". */
const TIME_12 = 'h:mm aaa'

/** How a time reads on a 24-hour clock, such as "20:00". */
const TIME_24 = 'HH:mm'

/** How the hour of a time reads on a 24-hour clock, with a leading zero, such as "08". */
const HOUR_24 = 'HH'

/** The pattern of the locale's short time, which holds an `a` where the locale has am and pm. */
const MERIDIEM = 'a'

/** How a day reads on its own, such as "17th Oct 2026". */
const DAY = 'do MMM yyyy'

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

/**
 * How a date field and its picker write, read and step through moments. Typed structurally, so it
 * fits shared/ui's IDateTimeFormat without core importing the UI.
 */
export interface IDateField {
  /**
   * Writes a moment as the field shows it.
   * @param date - The moment.
   * @returns The text, such as "Sat 31st Oct 2026, 8:00 pm".
   */
  display: (date: Date) => string
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
   * Whether the locale tells time on a 12-hour clock, with am and pm.
   * @returns False when the picker should leave out its am and pm switch.
   */
  uses12Hour: () => boolean
  /**
   * Writes the hour of a moment as the locale's clock shows it.
   * @param date - The moment.
   * @returns The hour, such as "8", or "08" on a 24-hour clock.
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

/** What every date-fns call that words or lays out a date is given: the locale, and in time a zone. */
type TOptions = NonNullable<Parameters<typeof format>[2]>

/**
 * Date parsing and wording for the whole client, so a moment reads the same on every screen. It is
 * the only place that calls date-fns. Deps creates one; reach it through useDeps().helpers.dates.
 */
export class DateFormatter {
  /** The locale that every wording, week layout and clock follows; the one place it is chosen. */
  private readonly locale: Locale

  /** The options every date-fns call is given, so a time zone would be added here and nowhere else. */
  private readonly options: TOptions

  /**
   * Chooses the locale. The default is English as written in India, which starts the week on
   * Monday and tells time on a 12-hour clock.
   * @param locale - The date-fns locale to follow.
   */
  constructor(locale: Locale = enIN) {
    this.locale = locale
    this.options = { locale }
  }

  /**
   * What a date field needs to write and read a moment, ready to pass as its `format` prop. It is
   * one object for the life of the helper, so passing it never changes a field's props.
   */
  readonly field: IDateField = {
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
     * @returns The text, such as "Sat 31st Oct 2026, 8:00 pm".
     */
    display: (date: Date): string => this.display(date),
    /**
     * Whether the locale tells time on a 12-hour clock, with am and pm.
     * @returns False when the picker should leave out its am and pm switch.
     */
    uses12Hour: (): boolean => this.uses12Hour(),
    /**
     * Writes the hour of a moment as the locale's clock shows it.
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
   * Writes an event's moment: "Sat 31st Oct 2026, 8:00 pm".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  eventWhen(iso: string): string {
    return this.display(this.parse(iso))
  }

  /**
   * Writes a moment the way an event's moment reads: "Sat 31st Oct 2026, 8:00 pm".
   * @param date - The moment, such as one a picker gave.
   * @returns The text, in the device's time zone.
   */
  display(date: Date): string {
    return format(date, `${EVENT_DAY}, ${this.time()}`, this.options)
  }

  /**
   * Writes a voting deadline: "Thu, 9:00 pm".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  deadline(iso: string): string {
    return format(this.parse(iso), `${DEADLINE_DAY}, ${this.time()}`, this.options)
  }

  /**
   * Writes the day of a moment on its own, such as when a past event closed, a place was saved or
   * a squad was made: "17th Oct 2026".
   * @param iso - The moment, as the API sends it.
   * @returns The text, in the device's time zone.
   */
  day(iso: string): string {
    return format(this.parse(iso), DAY, this.options)
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
    return format(month, MONTH, this.options)
  }

  /**
   * Writes the initials that head the picker's columns: "M", "T", "W", "T", "F", "S", "S".
   * @returns Seven letters, Monday first.
   */
  weekdayLabels(): string[] {
    const monday = startOfWeek(this.today(), this.options)

    return eachDayOfInterval({ end: endOfWeek(monday, this.options), start: monday }).map(
      (day: Date): string => format(day, WEEKDAY_INITIAL, this.options),
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
      this.options,
    )

    return starts.map((monday: Date): (Date | undefined)[] =>
      eachDayOfInterval({ end: endOfWeek(monday, this.options), start: monday }).map(
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
    return format(date, DAY_NAME, this.options)
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
   * Whether the locale tells time on a 12-hour clock, with am and pm.
   * @returns False when the picker should leave out its am and pm switch.
   */
  uses12Hour(): boolean {
    return this.locale.formatLong.time({ width: 'short' }).includes(MERIDIEM)
  }

  /**
   * Writes the hour of a moment as the locale's clock shows it: "8", or "08" on a 24-hour clock.
   * @param date - The moment.
   * @returns The hour's digits.
   */
  hourText(date: Date): string {
    return format(date, this.uses12Hour() ? HOUR : HOUR_24, this.options)
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

  /**
   * The pattern of a time on the locale's clock.
   * @returns The 12-hour pattern or the 24-hour one.
   */
  private time(): string {
    return this.uses12Hour() ? TIME_12 : TIME_24
  }
}
