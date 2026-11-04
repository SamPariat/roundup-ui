/** A mobile number as the backend takes it: +91 then ten digits that start with 6 to 9. */
const E164_INDIA = /^\+91[6-9]\d{9}$/

/** The national part of an Indian mobile number. */
const NATIONAL_INDIA = /^[6-9]\d{9}$/

/** How many digits the national number has. */
const NATIONAL_LENGTH = 10

/** The country prefix without its plus sign. */
const COUNTRY = '91'

/**
 * Phone number helpers for Indian mobile numbers. Static methods only; the dependency container
 * holds the class, so a test can swap it.
 */
export class Phone {
  /**
   * Keeps only what a person can type in the phone field: digits, at most ten. A pasted number with
   * the country code (+91 98765 43210) loses the prefix.
   * @param text - Whatever the field now holds.
   * @returns Up to ten digits.
   */
  static toNationalDigits(text: string): string {
    const digits = text.replaceAll(/\D/g, '')

    const national =
      digits.length > NATIONAL_LENGTH && digits.startsWith(COUNTRY) ? digits.slice(2) : digits

    return national.slice(0, NATIONAL_LENGTH)
  }

  /**
   * Whether the digits are a complete Indian mobile number.
   * @param digits - The national digits.
   * @returns True for ten digits starting 6 to 9.
   */
  static isValidMobile(digits: string): boolean {
    return NATIONAL_INDIA.test(digits)
  }

  /**
   * Turns national digits into the E.164 form the API takes.
   * @param digits - The ten national digits.
   * @returns For example +919876543210.
   */
  static toE164(digits: string): string {
    return `+${COUNTRY}${digits}`
  }

  /**
   * Whether a string is a valid E.164 Indian mobile number.
   * @param value - A route parameter or any other string.
   * @returns True when it is +91 and a valid mobile number.
   */
  static isE164(value: string | undefined): value is string {
    return value !== undefined && E164_INDIA.test(value)
  }

  /**
   * Formats an E.164 number for reading aloud and on screen.
   * @param e164 - A valid E.164 Indian mobile number.
   * @returns For example +91 98765 43210.
   */
  static format(e164: string): string {
    return `+${COUNTRY} ${e164.slice(3, 8)} ${e164.slice(8)}`
  }
}
