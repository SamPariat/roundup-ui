import { ApiError } from '@roundup/api'

import { ErrorKey } from '../../src/helpers/error-key'

describe('ErrorKey.toMessage', () => {
  it.each([
    [0, 'phone', 'errors.offline'],
    [400, 'phone', 'errors.invalidPhone'],
    [400, 'name', 'errors.invalidName'],
    [400, 'code', 'errors.wrongCode'],
    [401, 'code', 'errors.wrongCode'],
    [429, 'code', 'errors.codeExpired'],
    [429, 'phone', 'errors.tooManyRequests'],
    [500, 'phone', 'errors.generic'],
    [400, 'squadName', 'errors.invalidSquadName'],
    [404, 'squad', 'errors.squadNotFound'],
    [404, 'addMember', 'errors.notOnRoundup'],
    [409, 'role', 'errors.needsAnAdmin'],
    [404, 'role', 'errors.generic'],
    [0, 'addMember', 'errors.offline'],
  ] as const)('maps %i on %s to %s', (status, context, key) => {
    expect(ErrorKey.toMessage(new ApiError(status, 'x'), context).key).toBe(key)
  })

  it.each([
    ['user is already a member of this squad: u2', 'errors.alreadyInSquad'],
    ['squad is full: 50 members', 'errors.squadFull'],
  ] as const)('maps a 409 saying %j on addMember to %s', (message, key) => {
    expect(ErrorKey.toMessage(new ApiError(409, message), 'addMember').key).toBe(key)
  })

  it('quotes the request id on an unexpected failure', () => {
    expect(ErrorKey.toMessage(new ApiError(500, 'x', 'req-3'), 'name')).toEqual({
      key: 'errors.genericWithId',
      requestId: 'req-3',
    })
  })

  it('treats anything else as generic', () => {
    expect(ErrorKey.toMessage(new Error('boom'), 'name').key).toBe('errors.generic')
  })
})
