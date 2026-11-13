import type { IDateTimeFormat } from '../../src/components/DateTimePicker'

/** The short names of the weekdays, Sunday first, as Date#getDay counts them. */
const WEEKDAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The full names of the weekdays, Sunday first. */
const WEEKDAY_NAMES: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** The names of the months, January first. */
const MONTHS: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** One minute in milliseconds. */
const MINUTE = 60_000

/** The first hour of the afternoon. */
const NOON = 12

/** The moment the tests treat as now: Saturday 14 November 2026, 9:30 am. */
const NOW = new Date(2026, 10, 14, 9, 30)

/**
 * A stand-in for core's DateFormatter in the ui tests, which cannot use its date library. It does
 * the little date math the picker asks for with plain Dates, Monday first.
 */
class StandInFormat implements IDateTimeFormat {
  /** Whether the clock has am and pm. */
  private readonly twelve: boolean

  /**
   * Chooses the clock.
   * @param twelve - Whether the clock has am and pm.
   */
  constructor(twelve: boolean) {
    this.twelve = twelve
  }

  /**
   * Moves a moment by minutes.
   * @param date - The moment.
   * @param minutes - How many minutes to move.
   * @returns The moment that many minutes away.
   */
  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * MINUTE)
  }

  /**
   * Moves to the first of a month some months away.
   * @param date - The moment.
   * @param months - How many months to move.
   * @returns The first of that month.
   */
  addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, 1)
  }

  /**
   * Writes a day for a screen reader.
   * @param date - The day to write.
   * @returns The text, such as "Saturday 31 October".
   */
  dayLabel(date: Date): string {
    return `${WEEKDAY_NAMES[date.getDay()] ?? ''} ${String(date.getDate())} ${MONTHS[date.getMonth()] ?? ''}`
  }

  /**
   * Writes the number of a day.
   * @param date - The day to write.
   * @returns The day of the month.
   */
  dayText(date: Date): string {
    return String(date.getDate())
  }

  /**
   * Writes a moment on one line.
   * @param date - The moment.
   * @returns The text, such as "Sat 31 Oct, 8:00 pm".
   */
  display(date: Date): string {
    return `${WEEKDAYS[date.getDay()] ?? ''} ${String(date.getDate())} ${(MONTHS[date.getMonth()] ?? '').slice(0, 3)}, ${String(this.twelveHour(date))}:${this.pad(date.getMinutes())} ${this.isPm(date) ? 'pm' : 'am'}`
  }

  /**
   * Writes the hour on this format's clock.
   * @param date - The moment.
   * @returns The hour, such as "8", or "08" on a 24-hour clock.
   */
  hourText(date: Date): string {
    return this.twelve ? String(this.twelveHour(date)) : this.pad(date.getHours())
  }

  /**
   * Whether a moment's day comes before another's.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when `date` is on an earlier day.
   */
  isBeforeDay(date: Date, other: Date): boolean {
    return this.dayStart(date) < this.dayStart(other)
  }

  /**
   * Whether a moment is from noon on.
   * @param date - The moment.
   * @returns True for pm.
   */
  isPm(date: Date): boolean {
    return date.getHours() >= NOON
  }

  /**
   * Whether two moments are on one day.
   * @param date - The moment to test.
   * @param other - The moment it is compared with.
   * @returns True when both are on one day.
   */
  isSameDay(date: Date, other: Date): boolean {
    return this.dayStart(date) === this.dayStart(other)
  }

  /**
   * Writes the minutes of a moment.
   * @param date - The moment.
   * @returns The minutes, such as "05".
   */
  minuteText(date: Date): string {
    return this.pad(date.getMinutes())
  }

  /**
   * Writes a month and year.
   * @param month - Any moment in the month.
   * @returns The text, such as "November 2026".
   */
  monthLabel(month: Date): string {
    return `${MONTHS[month.getMonth()] ?? ''} ${String(month.getFullYear())}`
  }

  /**
   * Finds the first of a month.
   * @param date - Any moment in the month.
   * @returns Midnight on the 1st.
   */
  startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  /**
   * Reads the stand-in clock.
   * @returns The moment the tests treat as now.
   */
  today(): Date {
    return NOW
  }

  /**
   * Whether this format has am and pm.
   * @returns True on a 12-hour clock.
   */
  uses12Hour(): boolean {
    return this.twelve
  }

  /**
   * Writes the column heads, Monday first.
   * @returns Seven letters.
   */
  weekdayLabels(): string[] {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  }

  /**
   * Lays a month out in weeks from Monday, with blanks outside the month.
   * @param month - Any moment in the month.
   * @returns The weeks of seven cells.
   */
  weeks(month: Date): (Date | undefined)[][] {
    return this.layout(month)
  }

  /**
   * Moves a moment to another day at the same time.
   * @param date - The moment whose time is kept.
   * @param day - The day to move it to.
   * @returns The moment on that day.
   */
  withDay(date: Date, day: Date): Date {
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      date.getHours(),
      date.getMinutes(),
    )
  }

  /**
   * Writes a number with a leading zero.
   * @param value - The number, below 100.
   * @returns Two digits.
   */
  private pad(value: number): string {
    return String(value).padStart(2, '0')
  }

  /**
   * Finds the start of a moment's day.
   * @param date - The moment.
   * @returns Midnight of that day, in milliseconds.
   */
  private dayStart(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  }

  /**
   * Lays a month out in weeks from Monday.
   * @param month - Any moment in the month.
   * @returns The weeks of seven cells, with blanks outside the month.
   */
  private layout(month: Date): (Date | undefined)[][] {
    const year = month.getFullYear()
    const index = month.getMonth()
    const lead = (new Date(year, index, 1).getDay() + 6) % 7
    const length = new Date(year, index + 1, 0).getDate()

    const cells: (Date | undefined)[] = [
      ...Array.from({ length: lead }, (): Date | undefined => undefined),
      ...Array.from({ length }, (_, day): Date | undefined => new Date(year, index, day + 1)),
    ]

    while (cells.length % 7 !== 0) cells.push(undefined)

    return Array.from({ length: cells.length / 7 }, (_, week) =>
      cells.slice(week * 7, week * 7 + 7),
    )
  }

  /**
   * Reads an hour on a 12-hour clock.
   * @param date - The moment.
   * @returns The hour, 1 to 12.
   */
  private twelveHour(date: Date): number {
    return date.getHours() % NOON === 0 ? NOON : date.getHours() % NOON
  }
}

/**
 * Date fixtures for the ui tests. Static methods only.
 */
export class DateFixtures {
  /** The moment the tests treat as now. */
  static readonly now: Date = NOW

  /** A format on a 12-hour clock whose week starts on Monday. */
  static readonly format: IDateTimeFormat = new StandInFormat(true)

  /** A format on a 24-hour clock, which has no am and pm. */
  static readonly format24: IDateTimeFormat = new StandInFormat(false)
}
