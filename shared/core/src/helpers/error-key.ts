import type { en } from '@roundup/i18n'

import { ApiError } from '@roundup/api'

/** A key of the translated error messages, such as errors.offline. */
export type TErrorKey = `errors.${keyof typeof en.errors}`

/** Which step failed, since the same status means different things on each. */
export type TErrorContext = 'code' | 'name' | 'phone' | 'profile'

/** An error ready to show: the message key and, for the generic message, the request to quote. */
export interface IErrorMessage {
  /** The i18n key of the message. */
  key: TErrorKey
  /** The gateway's X-Request-ID, set only for the generic message, which prints it. */
  requestId: string | undefined
}

/**
 * Maps errors to messages. Static methods only; the dependency container holds the class.
 */
export class ErrorKey {
  /**
   * Maps whatever a request threw to a message key. 400 is invalid input, 401 a wrong code, 429 too
   * many requests (or too many tries at a code), 0 no connection, and anything else a generic
   * message that carries the request ID so a person can quote it.
   * @param error - What was thrown.
   * @param context - Which step failed.
   * @returns The key to translate and the request ID to fill in.
   */
  static toMessage(error: unknown, context: TErrorContext): IErrorMessage {
    if (!ApiError.is(error)) return { key: 'errors.generic', requestId: undefined }

    const { requestId, status } = error

    if (status === 0) return { key: 'errors.offline', requestId: undefined }

    if (status === 400 && context === 'phone') {
      return { key: 'errors.invalidPhone', requestId: undefined }
    }

    if (status === 400 && context === 'name') {
      return { key: 'errors.invalidName', requestId: undefined }
    }

    if ((status === 400 || status === 401) && context === 'code') {
      return { key: 'errors.wrongCode', requestId: undefined }
    }

    if (status === 429) {
      return {
        key: context === 'code' ? 'errors.codeExpired' : 'errors.tooManyRequests',
        requestId: undefined,
      }
    }

    return requestId === undefined
      ? { key: 'errors.generic', requestId: undefined }
      : { key: 'errors.genericWithId', requestId }
  }
}
