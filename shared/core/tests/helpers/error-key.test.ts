import { ApiError, HttpStatus } from '@roundup/api'

import { ErrorKey } from '../../src/helpers/error-key'

/** The helper under test. */
const errors = new ErrorKey()

describe('ErrorKey.toMessage', () => {
  it.each([
    [HttpStatus.noResponse, 'phone', 'errors.offline'],
    [HttpStatus.badRequest, 'phone', 'errors.invalidPhone'],
    [HttpStatus.badRequest, 'name', 'errors.invalidName'],
    [HttpStatus.badRequest, 'code', 'errors.wrongCode'],
    [HttpStatus.unauthorized, 'code', 'errors.wrongCode'],
    [HttpStatus.tooManyRequests, 'code', 'errors.codeExpired'],
    [HttpStatus.tooManyRequests, 'phone', 'errors.tooManyRequests'],
    [HttpStatus.internalServerError, 'phone', 'errors.generic'],
    [HttpStatus.badRequest, 'squadName', 'errors.invalidSquadName'],
    [HttpStatus.notFound, 'squad', 'errors.squadNotFound'],
    [HttpStatus.notFound, 'addMember', 'errors.notOnRoundup'],
    [HttpStatus.conflict, 'role', 'errors.needsAnAdmin'],
    [HttpStatus.notFound, 'role', 'errors.generic'],
    [HttpStatus.noResponse, 'addMember', 'errors.offline'],
    [HttpStatus.notFound, 'venue', 'errors.venueNotFound'],
    [HttpStatus.notFound, 'favorite', 'errors.venueNotFound'],
    [HttpStatus.badRequest, 'favorite', 'errors.generic'],
  ] as const)('maps %i on %s to %s', (status, context, key) => {
    expect(errors.toMessage(new ApiError(status, 'x'), context).key).toBe(key)
  })

  it.each([
    ['user is already a member of this squad: u2', 'errors.alreadyInSquad'],
    ['squad is full: 50 members', 'errors.squadFull'],
  ] as const)('maps a 409 saying %j on addMember to %s', (message, key) => {
    expect(errors.toMessage(new ApiError(HttpStatus.conflict, message), 'addMember').key).toBe(key)
  })

  it('quotes the request id on an unexpected failure', () => {
    expect(
      errors.toMessage(new ApiError(HttpStatus.internalServerError, 'x', 'req-3'), 'name'),
    ).toEqual({
      key: 'errors.genericWithId',
      requestId: 'req-3',
    })
  })

  it('treats anything else as generic', () => {
    expect(errors.toMessage(new Error('boom'), 'name').key).toBe('errors.generic')
  })
})
