import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Class name helpers. Static methods only.
 */
export class ClassHelper {
  /**
   * Joins class names and resolves Tailwind conflicts, so a later class overrides an earlier one (`p-2` then `p-4` leaves `p-4`).
   * @param inputs - Strings, falsy values and objects accepted by clsx.
   * @returns The merged class string.
   */
  static cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
  }
}
