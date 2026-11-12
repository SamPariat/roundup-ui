import type { en } from '@roundup/i18n'

import { ApiError, HttpStatus } from '@roundup/api'

/** A key of the translated error messages, such as errors.offline. */
export type TErrorKey = `errors.${keyof typeof en.errors}`

/** Which step failed, since the same status means different things on each. */
export type TErrorContext =
  | 'addMember'
  | 'code'
  | 'favorite'
  | 'name'
  | 'phone'
  | 'profile'
  | 'role'
  | 'squad'
  | 'squadName'
  | 'venue'

/** How the backend's message starts when a squad is full; it sends no error codes. */
const SQUAD_FULL = 'squad is full'

/** The message of each status on the steps where it has its own meaning. */
const BY_STATUS: Partial<Record<number, Partial<Record<TErrorContext, TErrorKey>>>> = {
  [HttpStatus.badRequest]: {
    code: 'errors.wrongCode',
    name: 'errors.invalidName',
    phone: 'errors.invalidPhone',
    squadName: 'errors.invalidSquadName',
  },
  [HttpStatus.unauthorized]: { code: 'errors.wrongCode' },
  [HttpStatus.notFound]: {
    addMember: 'errors.notOnRoundup',
    favorite: 'errors.venueNotFound',
    squad: 'errors.squadNotFound',
    venue: 'errors.venueNotFound',
  },
  [HttpStatus.conflict]: { role: 'errors.needsAnAdmin' },
}

/** An error ready to show: the message key and, for the generic message, the request to quote. */
export interface IErrorMessage {
  /** The i18n key of the message. */
  key: TErrorKey
  /** The gateway's X-Request-ID, set only for the generic message, which prints it. */
  requestId: string | undefined
}

/**
 * Maps errors to messages. Deps creates one; reach it through useDeps().helpers.errors.
 */
export class ErrorKey {
  /**
   * Maps whatever a request threw to a message key. 400 is invalid input, 401 a wrong code, 429 too
   * many requests (or too many tries at a code), 404 a missing squad or a number not on Roundup,
   * 409 a member already there, a full squad or a squad left without an admin, 404 on a venue or
   * on saving one a place that cannot be found, 0 no connection, and anything else a generic message that carries the request ID so a person can quote it.
   * @param error - What was thrown.
   * @param context - Which step failed.
   * @returns The key to translate and the request ID to fill in.
   */
  toMessage(error: unknown, context: TErrorContext): IErrorMessage {
    if (!ApiError.is(error)) return { key: 'errors.generic', requestId: undefined }

    const { requestId, status } = error

    if (status === HttpStatus.noResponse) return { key: 'errors.offline', requestId: undefined }

    const key = this.forContext(status, error.message, context)

    if (key !== undefined) return { key, requestId: undefined }

    if (status === HttpStatus.tooManyRequests) {
      return {
        key: context === 'code' ? 'errors.codeExpired' : 'errors.tooManyRequests',
        requestId: undefined,
      }
    }

    return requestId === undefined
      ? { key: 'errors.generic', requestId: undefined }
      : { key: 'errors.genericWithId', requestId }
  }

  /**
   * Maps the statuses whose meaning depends on the step that failed.
   * @param status - The HTTP status.
   * @param message - The server's error text, which says why a 409 happened.
   * @param context - Which step failed.
   * @returns The message key, or undefined when the status means the same on every step.
   */
  private forContext(
    status: number,
    message: string,
    context: TErrorContext,
  ): TErrorKey | undefined {
    if (status === HttpStatus.conflict && context === 'addMember') {
      return message.startsWith(SQUAD_FULL) ? 'errors.squadFull' : 'errors.alreadyInSquad'
    }

    return BY_STATUS[status]?.[context]
  }
}
