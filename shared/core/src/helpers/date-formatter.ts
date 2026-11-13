import { addDays, format, formatISO, isAfter, parseISO, set } from 'date-fns'
import { enIN } from 'date-fns/locale'

/** How a moment reads with its weekday, day and time, such as "Sat 31 Oct, 8:00 pm". */
const EVENT_WHEN = 'EEE d MMM, h:mm aaa'

/** How a deadline reads with its weekday and time, such as "Thu, 9:00 pm". */
const DEADLINE = 'EEE, h:mm aaa'

/** How a past event's day reads, such as "17 Oct". */
const PAST_DAY = 'd MMM'

/**
 * Date parsing and wording for the whole client, so a moment reads the same on every screen. It is
 * the only place that calls date-fns. Deps creates one; reach it through useDeps().helpers.dates.
 */
export class DateFormatter {
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
    return format(this.parse(iso), EVENT_WHEN, { locale: enIN })
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
