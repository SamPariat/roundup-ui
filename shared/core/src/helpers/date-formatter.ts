import { addDays, format, formatISO, isAfter, isValid, parse, parseISO, set } from 'date-fns'
import { enIN } from 'date-fns/locale'

/** How a moment reads with its weekday, day and time, such as "Sat 31 Oct, 8:00 pm". */
const EVENT_WHEN = 'EEE d MMM, h:mm aaa'

/** How a deadline reads with its weekday and time, such as "Thu, 9:00 pm". */
const DEADLINE = 'EEE, h:mm aaa'

/** How a past event's day reads, such as "17 Oct". */
const PAST_DAY = 'd MMM'

/** How a `datetime-local` input spells its value: the local date and time without a zone. */
const INPUT = "yyyy-MM-dd'T'HH:mm"

/**
 * How a date field writes and reads a moment. Typed structurally, so it fits shared/ui's
 * IDateTimeFormat without core importing the UI.
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
     * Writes a moment as the field shows it.
     * @param date - The moment.
     * @returns The text, such as "Sat 31 Oct, 8:00 pm".
     */
    display: (date: Date): string => this.display(date),
    /**
     * Reads a `datetime-local` input's value.
     * @param text - The input's value.
     * @returns The moment, or undefined while the input is incomplete or invalid.
     */
    fromInput: (text: string): Date | undefined => this.fromInput(text),
    /**
     * Writes a moment as a `datetime-local` input takes it.
     * @param date - The moment.
     * @returns The local date and time, such as 2026-10-31T20:00.
     */
    toInput: (date: Date): string => this.toInput(date),
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
}
