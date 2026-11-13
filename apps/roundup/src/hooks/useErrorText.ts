import type { TErrorKey } from '@roundup/core'

import { useT } from '@roundup/i18n'

/**
 * Translates the error key a view model gives, filling in the request ID the generic message
 * quotes.
 * @param error - The key from the view model, or undefined when there is no error.
 * @param requestId - The request ID from the view model, when it has one.
 * @returns The message to show, or undefined when there is no error.
 */
export const useErrorText = (
  error: TErrorKey | undefined,
  requestId?: string,
): string | undefined => {
  const { t } = useT()

  return error === undefined ? undefined : t(error, { requestId: requestId ?? '' })
}
