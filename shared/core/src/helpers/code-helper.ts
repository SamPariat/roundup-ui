/** How many digits the sign-in code has. */
export const CODE_LENGTH = 6

/**
 * Sign-in code helpers. Static methods only; the dependency container holds the class, so a test
 * can swap it.
 */
export class CodeHelper {
  /**
   * Keeps only digits, at most the code length.
   * @param text - Whatever the field now holds.
   * @returns Up to six digits.
   */
  static toDigits(text: string): string {
    return text.replaceAll(/\D/g, '').slice(0, CODE_LENGTH)
  }
}
