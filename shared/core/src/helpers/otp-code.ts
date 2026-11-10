/** How many digits the sign-in code has. */
export const CODE_LENGTH = 6

/**
 * Sign-in code helpers. Deps creates one; reach it through useDeps().helpers.code, so a test can
 * pass its own.
 */
export class OtpCode {
  /**
   * Keeps only digits, at most the code length.
   * @param text - Whatever the field now holds.
   * @returns Up to six digits.
   */
  toDigits(text: string): string {
    return text.replaceAll(/\D/g, '').slice(0, CODE_LENGTH)
  }
}
